package app

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
)

const aud = "http://localhost:3000"
const iss = "dev-f7sryk8l4taw52yj.uk.auth0.com"

func Run() error {

	issuerURL, err := url.Parse("https://" + iss + "/")
	if err != nil {
		return fmt.Errorf("auth can't parse the issuerURL: %w", err)
	}
	provider := jwks.NewCachingProvider(issuerURL, 5*time.Minute)
	jwtValidator, err := validator.New(
		provider.KeyFunc,
		validator.RS256,
		issuerURL.String(),
		[]string{aud},
		validator.WithCustomClaims(
			func() validator.CustomClaims {
				return &CustomClaims{}
			},
		),
		validator.WithAllowedClockSkew(time.Hour*24),
	)
	if err != nil {
		return fmt.Errorf("auth can't set up the jwt validator: %w", err)
	}

	mw := jwtmiddleware.New(jwtValidator.ValidateToken, jwtmiddleware.WithErrorHandler(jwtmiddleware.DefaultErrorHandler))
	h := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := r.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		b, err := json.Marshal(claims)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(b)
	})
	return http.ListenAndServe(":3000", mw.CheckJWT(h))
}

type CustomClaims struct {
	Tenant       string `json:"tenant"`
	SchemaPrefix string `json:"schema_pre"`
	Uid          string `json:"uid"`
	EUid         string `json:"euid"`
	EName        string `json:"ename"`
	Email        string `json:"email"`
	Name         string `json:"name"`
}

func (c CustomClaims) Validate(ctx context.Context) error {
	return nil
}
