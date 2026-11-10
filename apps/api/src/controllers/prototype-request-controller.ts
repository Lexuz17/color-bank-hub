// Prototype requests (Color Bank). Used by: Color Bank list, detail, new request form, admin workflow.
// Status: built in workflow-controller.ts, move the code here.
//
// Method Path                                     Handler            Permission         Input (contracts)            DB
// GET    /api/prototype-requests                  listRequests       (auth)             prototype.prototypeQuery     read  prototype_requests
// GET    /api/prototype-requests/:id              findRequest        (auth)             uuid                         read  prototype_requests
// POST   /api/prototype-requests                  createRequest      prototype:create   prototype.prototypeInput     write prototype_requests (auto_name {Hue}_{code}{seq})
// PATCH  /api/prototype-requests/:id/status       transition         prototype:process  prototype.transitionInput    write prototype_requests, audit_logs
// PATCH  /api/prototype-requests/:id/formulation  updateFormulation  prototype:process  prototype.formulationInput   write prototype_requests
//
// Who does what:
// | Action                                   | Roles                    | Permission (contracts/rbac.ts)       |
// | New request                              | R&D, PID, TSI, Admin     | prototype:create (add "rnd": the brief's form lists RnD) |
// | See every request (All, Pending review,  | Website Admin, R&D       | prototype:process                    |
// |   Formulating)                           |                          |                                      |
// | See own requests only ("My requests")    | everyone else            | -                                    |
// | Approve / Decline (pending)              | Website Admin only       | prototype:decide (new: ["website_admin"]) |
// | Start formulating, formulate, complete   | Website Admin, R&D       | prototype:process                    |
//
// Rules (service):
// - List and :id: can(role, "prototype:process") -> all; else requester_id = user. Someone else's id -> NOT_FOUND
//   PROTOTYPE_NOT_FOUND.
// - transition to approved | declined needs can(role, "prototype:decide") -> FORBIDDEN DECIDE_NOT_ALLOWED. The permission
//   depends on the target status, so the service checks it, not the route.
// - Allowed moves only (already in workflow-repository): pending -> approved | declined; approved -> formulating;
//   formulating -> completed ("Done Formulating", needs a result photo). Anything else -> INVALID_TRANSITION.
//   declined needs declineReason.
// - updateFormulation only while status is formulating -> NOT_FORMULATING ("Save draft" = same call).
//
// Status (DB enum request_status) vs brief: pending = Pending, approved = Approved, formulating = Formulating,
// completed = Result uploaded, declined = Declined. Filter chip "Closed" = completed + declined (no separate status).
// Later: result_photo_url -> photo key via upload-service (store keys, not URLs).
// Note: the existing repository calls fail(); move those rules to prototype-request-service.

export {};
