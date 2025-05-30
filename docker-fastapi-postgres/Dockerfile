FROM python:latest

WORKDIR /src

# питон не будет создавать pyc файлы
ENV PYTHONDONTWRITEBYTECODE 1 
# позволит корректно отображать выводы , пример для дебага
ENV PYTHONUNBUFFERED 1
# копирование всего содержимого из левого пути (лежит на компьютере), в правый (контейнер)
COPY requirements.txt requirements.txt
#создает новый слой поверх текущего и выполняет указанную программу в нем, фиксируя результат выполнения программы в новом слое. Позволит сбилдить новый образ поверх старого
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY ./app app
