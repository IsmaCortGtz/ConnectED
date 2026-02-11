package sfu

import (
	"context"
	"log"
)

// AuthorizeUser checks if a user is authorized to join a session.
// This function is designed to be implemented with database calls or external services.
// For now, it always returns true, but it can be easily extended.
//
// Parameters:
//   - ctx: context for cancellation and timeouts (important for DB calls)
//   - userID: the user identifier
//   - sessionID: the session identifier
//
// Returns:
//   - bool: true if user is authorized, false otherwise
//   - error: any error that occurred during authorization (DB connection, network, etc.)
func AuthorizeUser(ctx context.Context, userID string, sessionID string) (bool, error) {
	log.Printf("[AUTH] AuthorizeUser called: userID=%s sessionID=%s", userID, sessionID)

	// Simulate async operation (in real implementation, this would call a database)
	// You can add context timeout handling here for DB queries:
	// select {
	// case <-ctx.Done():
	//     return false, ctx.Err()
	// default:
	// }

	// TODO: Replace with actual authorization logic
	// Example implementations:
	//
	// 1. Database query:
	// rows, err := db.QueryContext(ctx, "SELECT authorized FROM sessions WHERE user_id = ? AND session_id = ?", userID, sessionID)
	// if err != nil {
	//     return false, err
	// }
	// var authorized bool
	// if rows.Next() {
	//     if err := rows.Scan(&authorized); err != nil {
	//         return false, err
	//     }
	// }
	// return authorized, nil
	//
	// 2. External HTTP service:
	// req, _ := http.NewRequestWithContext(ctx, "GET", fmt.Sprintf("http://auth-service/check?user=%s&session=%s", userID, sessionID), nil)
	// resp, err := http.DefaultClient.Do(req)
	// if err != nil {
	//     return false, err
	// }
	// defer resp.Body.Close()
	// return resp.StatusCode == http.StatusOK, nil

	// For now, always authorize
	log.Printf("[AUTH] AuthorizeUser: authorized=%v", true)
	return true, nil
}
