#

###
```shell
pnpm run dev
```


##### Product

```shell
curl 'http://127.0.0.1:5555/products' | jq
```
##### Create Product
```shell
curl -X POST http://localhost:5555/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop Thinkpad VKL", "description": "akdoffd"}'
```
##### Update Product
```shell
curl -X PATCH http://localhost:5555/products/3 \
  -H "Content-Type: application/json" \
  -d '{ "description": "ciquan xxxx"}'
```

##### Delete Product
```shell
curl -X DELETE http://localhost:5555/products/1 | jq 
```



```shell GET ALL
curl 'http://127.0.0.1:5555/stores' | jq
```
##### Create 
```shell
curl -X POST http://localhost:5555/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "XYZ", "address": "akdoffd", "phone": "Cua hang 1", "email": "xyz@mail.com"}'
```
##### Update 
```shell
curl -X PATCH http://localhost:5555/stores/1 \
  -H "Content-Type: application/json" \
  -d '{ "name": "ciquan xxxx"}'
```
##### Delete
```shell
curl -X DELETE http://localhost:5555/stores/2 | jq 
```



#### Supplier 


```shell GET ALL
curl 'http://127.0.0.1:5555/suppliers' | jq
```
##### Create
```shell
curl -X POST http://localhost:5555/suppliers \
  -H "Content-Type: application/json" \
  -d '{"name": "XYxccZ", "address": "akdoffd", "phone": "Cua hang 1", "email": "xyz@mail.com"}'
```
##### Update
```shell
curl -X PATCH http://localhost:5555/stores/1 \
  -H "Content-Type: application/json" \
  -d '{ "name": "ciquan xxxx"}'
```
##### Delete
```shell
curl -X DELETE http://localhost:5555/stores/2 | jq 
```


##### get Info

```shell
curl 'http://127.0.0.1:5555/customer' | jq
```

##### get Info

```shell
curl 'http://127.0.0.1:5555/customer/raw' | jq
```
