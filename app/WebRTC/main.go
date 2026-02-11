package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"webrtc-sfu/sfu"
)

func main() {
	server := sfu.NewServer()

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", server.HandleWebSocket)
	mux.Handle("/", http.FileServer(http.Dir("./client")))

	// Servidor HTTP en puerto 8080
	httpAddr := ":8080"
	if v := os.Getenv("HTTP_PORT"); v != "" {
		httpAddr = ":" + v
	}

	httpServer := &http.Server{
		Addr:              httpAddr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	// Servidor HTTPS en puerto 8443
	httpsAddr := ":8443"
	if v := os.Getenv("HTTPS_PORT"); v != "" {
		httpsAddr = ":" + v
	}

	httpsServer := &http.Server{
		Addr:              httpsAddr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	// Certificados SSL
	certFile := os.Getenv("CERT_FILE")
	keyFile := os.Getenv("KEY_FILE")

	if certFile == "" {
		certFile = "/etc/apache2/ssl/localhost.crt"
	}
	if keyFile == "" {
		keyFile = "/etc/apache2/ssl/localhost.key"
	}

	// Iniciar servidor HTTP en goroutine
	go func() {
		log.Printf("HTTP server listening on %s (ws://)", httpAddr)
		if err := httpServer.ListenAndServe(); err != nil {
			log.Printf("HTTP server error: %v", err)
		}
	}()

	// Iniciar servidor HTTPS si existen los certificados
	if _, err := os.Stat(certFile); err == nil {
		if _, err := os.Stat(keyFile); err == nil {
			log.Printf("HTTPS server listening on %s (wss://) with certificates: %s, %s", httpsAddr, certFile, keyFile)
			if err := httpsServer.ListenAndServeTLS(certFile, keyFile); err != nil {
				log.Fatal(err)
			}
		} else {
			log.Printf("Warning: Key file not found (%s), HTTPS disabled", keyFile)
			select {} // Mantener el programa corriendo solo con HTTP
		}
	} else {
		log.Printf("Warning: Certificate file not found (%s), HTTPS disabled", certFile)
		select {} // Mantener el programa corriendo solo con HTTP
	}
}
