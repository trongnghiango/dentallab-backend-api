# Note

```shell
# Tạo khóa riêng tư (private key) - 2048 bit
openssl genrsa -out private.key 2048

# Trích xuất khóa công khai (public key) từ khóa riêng tư
openssl rsa -in private.key -pubout -out public.key
```