# Post-Call API Reference

## Base URL

```
https://api.wise2.io/v1/consulting/post-call
```

## Authentication

All endpoints require JWT Bearer token:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

---

## GET /post-call/:bookingId

Retrieve the post-call summary for a specific booking.

### Parameters

| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| `bookingId` | string | path | Yes | Unique booking ID |

### Request

```bash
curl -X GET https://api.wise2.io/v1/consulting/post-call/booking_abc123 \
  -H 'Authorization: Bearer eyJhbGciOi...'
```

### Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": "summary_xyz789",
    "bookingId": "booking_abc123",
    "recordingUrl": "https://drive.google.com/file/d/1abc123def456ghi789/view",
    "transcript": null,
    "summary": "Discussion focused on AI implementation strategy with three key phases: assessment, planning, and execution. Identified current gaps in technical infrastructure and recommended immediate actions for modernization.",
    "followUpDate": "2024-08-06T00:00:00Z",
    "followUpNotes": null,
    "sentAt": "2024-07-23T18:35:42Z",
    "createdAt": "2024-07-23T18:35:00Z",
    "updatedAt": "2024-07-23T18:35:42Z",
    "actionItems": [
      {
        "id": "action_1",
        "summaryId": "summary_xyz789",
        "title": "Evaluate cloud infrastructure providers",
        "description": "Compare AWS, Google Cloud, and Azure based on our requirements",
        "owner": "user",
        "dueDate": "2024-07-30T00:00:00Z",
        "completed": false,
        "createdAt": "2024-07-23T18:35:00Z",
        "updatedAt": "2024-07-23T18:35:00Z"
      },
      {
        "id": "action_2",
        "summaryId": "summary_xyz789",
        "title": "Create technical assessment document",
        "description": "Document current state of systems and identify modernization priorities",
        "owner": "consultant",
        "dueDate": "2024-07-30T00:00:00Z",
        "completed": false,
        "createdAt": "2024-07-23T18:35:00Z",
        "updatedAt": "2024-07-23T18:35:00Z"
      },
      {
        "id": "action_3",
        "summaryId": "summary_xyz789",
        "title": "Schedule vendor demos",
        "description": "Arrange demonstrations with top 3 infrastructure providers",
        "owner": "user",
        "dueDate": "2024-08-06T00:00:00Z",
        "completed": false,
        "createdAt": "2024-07-23T18:35:00Z",
        "updatedAt": "2024-07-23T18:35:00Z"
      }
    ]
  }
}
```

### Error Responses

**404 Not Found**
```json
{
  "status": "error",
  "message": "Post-call summary not found",
  "error": "NotFoundException"
}
```

**401 Unauthorized**
```json
{
  "status": "error",
  "message": "Unauthorized",
  "error": "UnauthorizedException"
}
```

---

## GET /post-call/:bookingId/stats

Get action item completion statistics for a booking.

### Parameters

| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| `bookingId` | string | path | Yes | Unique booking ID |

### Request

```bash
curl -X GET https://api.wise2.io/v1/consulting/post-call/booking_abc123/stats \
  -H 'Authorization: Bearer eyJhbGciOi...'
```

### Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "total": 5,
    "completed": 2,
    "remaining": 3,
    "completionPercentage": 40,
    "userOwned": 3,
    "consultantOwned": 2,
    "overdueDates": [
      {
        "id": "action_2",
        "title": "Review materials",
        "owner": "consultant",
        "dueDate": "2024-07-20T00:00:00Z",
        "completed": false
      }
    ]
  }
}
```

### Success Criteria

- `total`: Total action items
- `completed`: Number of completed items
- `remaining`: Items not yet completed
- `completionPercentage`: (completed / total) * 100
- `userOwned`: Items assigned to user
- `consultantOwned`: Items assigned to consultant
- `overdueDates`: Items with past due dates

---

## PATCH /post-call/action-items/:actionItemId/complete

Mark an action item as completed.

### Parameters

| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| `actionItemId` | string | path | Yes | Unique action item ID |

### Request

```bash
curl -X PATCH https://api.wise2.io/v1/consulting/post-call/action-items/action_1/complete \
  -H 'Authorization: Bearer eyJhbGciOi...'
```

### Response (200 OK)

```json
{
  "status": "success",
  "message": "Action item marked as completed"
}
```

### Side Effects

- Updates `ActionItem.completed` to `true`
- Updates `ActionItem.updatedAt` to current timestamp
- Broadcasts completion notification (if configured)

---

## PATCH /post-call/action-items/:actionItemId

Update action item details.

### Parameters

| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| `actionItemId` | string | path | Yes | Unique action item ID |

### Request Body

```json
{
  "title": "Updated action item title",
  "description": "Updated description text",
  "owner": "consultant",
  "dueDate": "2024-08-15T00:00:00Z",
  "completed": true
}
```

All fields are optional. Only provided fields will be updated.

### Request

```bash
curl -X PATCH https://api.wise2.io/v1/consulting/post-call/action-items/action_1 \
  -H 'Authorization: Bearer eyJhbGciOi...' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Complete infrastructure assessment",
    "completed": false
  }'
```

### Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": "action_1",
    "summaryId": "summary_xyz789",
    "title": "Complete infrastructure assessment",
    "description": "Compare AWS, Google Cloud, and Azure based on our requirements",
    "owner": "user",
    "dueDate": "2024-07-30T00:00:00Z",
    "completed": false,
    "createdAt": "2024-07-23T18:35:00Z",
    "updatedAt": "2024-07-23T20:15:42Z"
  }
}
```

### Validation

- `owner` must be "user", "consultant", or null
- `dueDate` must be ISO 8601 format
- `completed` must be boolean

### Error Responses

**400 Bad Request**
```json
{
  "status": "error",
  "message": "Invalid owner value. Must be 'user', 'consultant', or null",
  "error": "BadRequestException"
}
```

**404 Not Found**
```json
{
  "status": "error",
  "message": "Action item not found",
  "error": "NotFoundException"
}
```

---

## PATCH /post-call/:bookingId/process

Manually trigger post-call summary processing for a booking.

**Note**: Typically called automatically by scheduler. Use for testing or manual processing.

### Parameters

| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| `bookingId` | string | path | Yes | Unique booking ID |

### Request

```bash
curl -X PATCH https://api.wise2.io/v1/consulting/post-call/booking_abc123/process \
  -H 'Authorization: Bearer eyJhbGciOi...'
```

### Response (202 Accepted)

```json
{
  "status": "success",
  "message": "Post-call processing initiated"
}
```

### Processing Steps

1. Fetches booking details (user, consultant, service)
2. Searches for Google Meet recording
3. Retrieves transcript (if available)
4. Generates AI summary using Claude
5. Creates action items from summary
6. Stores in database
7. Sends email to user
8. Notifies consultant
9. Marks summary as sent

### Response Times

- **Typical**: 30-60 seconds
- **With recording fetch**: 1-3 minutes
- **Timeout**: 5 minutes

### Error Handling

If processing fails:
1. Error is logged with booking ID
2. Job is queued for retry (max 3 attempts)
3. Client receives 202 Accepted (processing is async)

### Error Responses

**404 Not Found**
```json
{
  "status": "error",
  "message": "Booking not found",
  "error": "NotFoundException"
}
```

**409 Conflict**
```json
{
  "status": "error",
  "message": "Summary already exists for booking",
  "error": "ConflictException"
}
```

---

## Data Models

### PostCallSummary

```typescript
interface PostCallSummary {
  id: string;                    // Unique ID (cuid)
  bookingId: string;             // Foreign key to Booking
  recordingUrl?: string;         // Google Drive recording link
  transcript?: string;           // Meeting transcript (if available)
  summary: string;               // AI-generated executive summary
  followUpDate?: Date;           // Recommended follow-up date
  followUpNotes?: string;        // Additional notes for follow-up
  sentAt?: Date;                 // When email was sent to user
  createdAt: Date;               // Created timestamp
  updatedAt: Date;               // Last updated timestamp
  actionItems: ActionItem[];     // Related action items
}
```

### ActionItem

```typescript
interface ActionItem {
  id: string;                    // Unique ID (cuid)
  summaryId: string;             // Foreign key to PostCallSummary
  title: string;                 // Action item title
  description?: string;          // Detailed description
  owner?: string;                // "user", "consultant", or null
  dueDate?: Date;                // When item is due
  completed: boolean;            // Whether item is completed
  createdAt: Date;               // Created timestamp
  updatedAt: Date;               // Last updated timestamp
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 202 | Accepted | Async processing started |
| 400 | Bad Request | Invalid parameters or request body |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User lacks permission for resource |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists or conflict detected |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error during processing |
| 503 | Service Unavailable | External service unavailable |

---

## Rate Limiting

Default rates:

| Endpoint | Limit | Window |
|----------|-------|--------|
| GET /post-call/:id | 100 req/min | Per user |
| GET /post-call/:id/stats | 100 req/min | Per user |
| PATCH /action-items/:id | 50 req/min | Per user |
| PATCH /action-items/:id/complete | 50 req/min | Per user |
| PATCH /:bookingId/process | 10 req/min | Per user |

Responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1721779200
```

---

## Webhooks (Future)

When implemented, the service will send webhooks for:

```typescript
type WebhookEvent = 
  | 'postcall.summary.created'
  | 'postcall.summary.sent'
  | 'actionitem.created'
  | 'actionitem.completed'
  | 'actionitem.overdue'
```

---

## Examples

### Example 1: Get Summary and Check Completion

```bash
# Get summary
SUMMARY=$(curl -s https://api.wise2.io/v1/consulting/post-call/booking_123 \
  -H "Authorization: Bearer $TOKEN")

# Check stats
curl -s https://api.wise2.io/v1/consulting/post-call/booking_123/stats \
  -H "Authorization: Bearer $TOKEN"

# Mark first action item as done
curl -X PATCH https://api.wise2.io/v1/consulting/post-call/action-items/action_1/complete \
  -H "Authorization: Bearer $TOKEN"
```

### Example 2: Update Action Item Owner and Due Date

```bash
curl -X PATCH https://api.wise2.io/v1/consulting/post-call/action-items/action_1 \
  -H 'Authorization: Bearer eyJhbGciOi...' \
  -H 'Content-Type: application/json' \
  -d '{
    "owner": "consultant",
    "dueDate": "2024-08-20T17:00:00Z"
  }'
```

### Example 3: Bulk Complete Action Items

```bash
# Get all action items for a booking
SUMMARY=$(curl -s https://api.wise2.io/v1/consulting/post-call/booking_123 \
  -H "Authorization: Bearer $TOKEN")

# Extract action item IDs and mark as completed
echo $SUMMARY | jq -r '.data.actionItems[].id' | while read id; do
  curl -X PATCH "https://api.wise2.io/v1/consulting/post-call/action-items/$id/complete" \
    -H "Authorization: Bearer $TOKEN"
done
```

### Example 4: Monitor Action Item Completion

```bash
# Poll stats every 5 minutes
while true; do
  STATS=$(curl -s https://api.wise2.io/v1/consulting/post-call/booking_123/stats \
    -H "Authorization: Bearer $TOKEN")
  
  PERCENTAGE=$(echo $STATS | jq '.data.completionPercentage')
  echo "Completion: $PERCENTAGE% - $(date)"
  
  sleep 300
done
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.wise2.io/v1/consulting',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Get summary
const summary = await client.get(`/post-call/${bookingId}`);
console.log(summary.data.data.summary);

// Mark action item as complete
await client.patch(`/post-call/action-items/${actionId}/complete`);

// Get stats
const stats = await client.get(`/post-call/${bookingId}/stats`);
console.log(`${stats.data.data.completionPercentage}% complete`);
```

### Python

```python
import requests

headers = {"Authorization": f"Bearer {token}"}
base_url = "https://api.wise2.io/v1/consulting"

# Get summary
response = requests.get(f"{base_url}/post-call/{booking_id}", headers=headers)
summary = response.json()["data"]

# Mark action item as complete
requests.patch(
    f"{base_url}/post-call/action-items/{action_id}/complete",
    headers=headers
)

# Get stats
response = requests.get(f"{base_url}/post-call/{booking_id}/stats", headers=headers)
stats = response.json()["data"]
print(f"{stats['completionPercentage']}% complete")
```

---

## Support

For API support:
- Documentation: [POSTCALL_SERVICE_DOCUMENTATION.md](./POSTCALL_SERVICE_DOCUMENTATION.md)
- Issues: GitHub Issues
- Email: support@wise2.io

---

**API Version**: 1.0  
**Last Updated**: July 23, 2024  
**Status**: Production Ready
