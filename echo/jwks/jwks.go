package jwks

import (
	"context"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"log"

	"gopkg.in/square/go-jose.v2"
)

type Provider interface {
	KeyFunc() KeyFunc
}

type KeyFunc func(context.Context) (interface{}, error)

type stubProvider struct {
}

const pemString = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAo1VrdBz8RxeARkwO7dyatf4RzTCwtvtQ4t9rtqAfnKABb1S+gG44V/KKL7ZANxRr4CnXIyBII4lDeAffylJ8A19Uo3VdcO71xSWfM6dQt/T7ATfScY49gEDfp9WMqQ1rCLaLyAXEqH9/foaYE9slDN2XnOxS05TuI1qMuI0pOQENbewJjvvgavHOQcCmplCCWTsUZhoQHyYA0jilhhRVlDXjelg96kZ4JyTwgItnoT+RVEerj3/y5wxgA3cMKl5IcadiBFNCCY5G/VuO9E8mbzOg7Ro8m1HylTjxc4ltZd1K9+NI+DP2qxHH9HN3M3Su85yEBeCNKH7TOOPcc1nw/QIDAQAB
-----END PUBLIC KEY-----`

func (stub *stubProvider) KeyFunc() KeyFunc {

	// Decode PEM data
	block, _ := pem.Decode([]byte(pemString))
	if block == nil {
		log.Fatalf("failed to decode PEM block")
	}

	// Parse the public key
	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		log.Fatalf("failed to parse public key: %v", err)
	}

	// Assert to the rsa.PublicKey type
	rsaPubKey, ok := pub.(*rsa.PublicKey)
	if !ok {
		log.Fatalf("not an RSA public key")
	}

	return func(ctx context.Context) (interface{}, error) {
		jwks := jose.JSONWebKeySet{
			Keys: []jose.JSONWebKey{
				{
					Key:       rsaPubKey,
					KeyID:     "https://keylord.vault.azure.net/keys/dev-f7sryk8l4taw52yj/2c0ab0f5d39c40b2b7d6e08415e222d9",
					Algorithm: string(jose.RS256),
				},
			},
		}
		return &jwks, nil
	}
}

func New() (Provider, error) {
	return &stubProvider{}, nil
}
