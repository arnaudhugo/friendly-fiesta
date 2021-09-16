openssl genrsa -out jwt-key 2056
openssl rsa -in jwt-key -outform PEM -pubout -out jwt-key.pub
