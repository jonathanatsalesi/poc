FROM golang:bookworm

WORKDIR /app

COPY . .

RUN go mod download
RUN go build -o /echo

CMD ["/echo"]