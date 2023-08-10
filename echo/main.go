package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"time"

	"echo/jwks"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/validator"
)

func main() {
	if err := fun(context.Background()); err != nil {
		log.Fatal(err)
	}
}

type State struct {
	//Tenant string `json:"tenant"`
}

func (s *State) Validate(ctx context.Context) error {
	return nil
}

const aud = "http://localhost:3000"
const iss = "dev-f7sryk8l4taw52yj.uk.auth0.com"

func fun(ctx context.Context) error {
	issuerURL, err := url.Parse("https://" + iss + "/")
	if err != nil {
		return fmt.Errorf("auth can't parse the issuerURL: %w", err)
	}
	provider, err := jwks.New()
	if err != nil {
		return fmt.Errorf("echo: can't create jwks provider: %w", err)
	}
	jwtValidator, err := validator.New(
		provider.KeyFunc(),
		validator.RS256,
		issuerURL.String(),
		[]string{aud},
		validator.WithAllowedClockSkew(time.Second*600000),
	)
	if err != nil {
		return fmt.Errorf("auth can't set up the jwt validator: %w", err)
	}

	extractor := jwtmiddleware.WithTokenExtractor(jwtmiddleware.ParameterTokenExtractor("token"))
	eh := jwtmiddleware.WithErrorHandler(func(w http.ResponseWriter, r *http.Request, err error) {
		log.Print(err)
		jwtmiddleware.DefaultErrorHandler(w, r, err)
	})
	mw := jwtmiddleware.New(jwtValidator.ValidateToken, eh, extractor)
	h := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Print(r.Body)
		w.Header().Add("Content-Type", r.Header["Accepts"][0])
		b, _ := io.ReadAll(r.Body)
		w.Write(b)
	})

	return http.ListenAndServe(":80", mw.CheckJWT(h))
}
