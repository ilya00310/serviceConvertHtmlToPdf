# serviceConvertHtmlToPdf
Реализовал серверную часть сервиса, позволяющего  хранить и разархивировать зип архив, храняющий html файл с его ресурсами(опциаонально), и конвертировать его в формат pdf, в базе так же хранятся логи операции конвертации, имеющие поля потраченной памяти и времени на эту операцию. Написана документация, подробная обработка ошибок, сервис завернут в докер.	

Чтобы начать работать с сервисом, нужно:

1. Прописать свой .env файл на основе .env.example

2. Установить зависимости и запустить docker-compose:

```
npm install
docker-compose up
```

3. Производить соответсвующие запросы через postman или curl

Адрес swagger: api/docs
