import requests
from django.utils import timezone
from celery import shared_task
from .models import ScanJob, Port
from bs4 import BeautifulSoup

import subprocess
import re
import os

@shared_task(bind=True)
def scan_ports(self, target, ports):
    # 创建一个新的ScanJob实例
    scan_job = ScanJob.objects.create(target=target, status='R', task_id=self.request.id)
    temp_file_path = f"/tmp/{scan_job.task_id}.txt"
    all_ports_found = set()  # 用来存储所有扫描到的端口和服务

    try:
        for _ in range(5):  # 执行五次扫描
            # 构建并执行nmap命令
            cmd = f"nmap -n --resolve-all -Pn --min-hostgroup 64 --max-retries 0 --host-timeout 10m --script-timeout 3m --version-intensity 9 --min-rate 10000 -T4 {target} -p {ports} -oN {temp_file_path}"
            process = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            _, stderr = process.communicate()

            if stderr or process.returncode != 0:
                scan_job.status = 'E'
                scan_job.error_message = f'Nmap 扫描失败: {stderr.decode()}'
                break

            # 读取输出并查找开放端口
            with open(temp_file_path, 'r') as file:
                output = file.read()
            open_ports = re.findall(r'(\d+)/tcp\s+open\s+(\S+)', output)
            new_ports_found = set(open_ports) - all_ports_found

            if new_ports_found:
                all_ports_found.update(new_ports_found)  # 更新所有找到的端口集合
                for port, service in new_ports_found:
                    new_port = Port.objects.create(
                        scan_job=scan_job,
                        port_number=int(port),
                        service_name=service,
                        protocol='tcp',
                        state='open',
                        ip_address=target
                    )
                    # 测试协议
                    new_port.http_code, new_port.http_title = check_protocol(target, port, 'http')
                    new_port.https_code, new_port.https_title = check_protocol(target, port, 'https')
                    new_port.save()

        if not all_ports_found:
            scan_job.status = 'E'
            scan_job.error_message = '没有找到开放的端口。'
        else:
            scan_job.status = 'C'

    except Exception as e:
        scan_job.status = 'E'
        scan_job.error_message = f'扫描过程中发生异常: {str(e)}'

    finally:
        scan_job.end_time = timezone.now()
        scan_job.save()
        os.remove(temp_file_path)

        if scan_job.status == 'E':
            return {'error': scan_job.error_message}
        return {'message': f'扫描完成: {target}'}

def check_protocol(ip, port, protocol):
    url = f"{protocol}://{ip}:{port}"
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10, verify=False)  # 禁用SSL证书验证
        status_code = response.status_code
        try:
            encoding = response.apparent_encoding
            # 使用指定的编码格式解码响应内容
            decoded_content = response.content.decode(encoding)
            # 使用BeautifulSoup解析HTML
            soup = BeautifulSoup(decoded_content, 'html.parser')
            # 获取标题
            title = soup.title.string
        except:
            title = '标题获取失败'
        # 只要请求没有引发异常，我们就认为端口支持HTTP/HTTPS
        return status_code, title
    except requests.exceptions.ConnectionError:
        # 连接错误意味着无法建立TCP连接
        return '000', '标题获取失败'
    except requests.exceptions.Timeout:
        # 超时意味着服务器没有在预定时间内响应
        return '000', '标题获取失败'
    except requests.exceptions.RequestException:
        # 处理其他所有请求相关的异常
        return '000', '标题获取失败'
