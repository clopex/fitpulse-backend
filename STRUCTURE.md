fitpulse-backend/
├── src/
│   ├── index.ts                        # Entry point, pokretanje servera
│   ├── app.ts                          # Express app setup, middleware
│   │
│   ├── config/
│   │   ├── supabase.ts                 # Supabase klijent
│   │   ├── env.ts                      # ENV validacija i export
│   │   └── constants.ts                # JWT expiry, bcrypt rounds itd
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts          # JWT verify, req.user inject
│   │   ├── role.middleware.ts          # Role guard (admin, trainer)
│   │   ├── validate.middleware.ts      # express-validator wrapper
│   │   └── error.middleware.ts         # Global error handler
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validator.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.routes.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.validator.ts
│   │   │
│   │   ├── trainers/
│   │   │   ├── trainers.routes.ts
│   │   │   ├── trainers.controller.ts
│   │   │   ├── trainers.service.ts
│   │   │   └── trainers.validator.ts
│   │   │
│   │   ├── classes/
│   │   │   ├── classes.routes.ts
│   │   │   ├── classes.controller.ts
│   │   │   ├── classes.service.ts
│   │   │   └── classes.validator.ts
│   │   │
│   │   ├── bookings/
│   │   │   ├── bookings.routes.ts
│   │   │   ├── bookings.controller.ts
│   │   │   ├── bookings.service.ts
│   │   │   └── bookings.validator.ts
│   │   │
│   │   ├── subscriptions/
│   │   │   ├── subscriptions.routes.ts
│   │   │   ├── subscriptions.controller.ts
│   │   │   └── subscriptions.service.ts
│   │   │
│   │   ├── workout/
│   │   │   ├── workout.routes.ts
│   │   │   ├── workout.controller.ts
│   │   │   ├── workout.service.ts
│   │   │   └── workout.validator.ts
│   │   │
│   │   ├── chat/
│   │   │   ├── chat.routes.ts
│   │   │   ├── chat.controller.ts
│   │   │   └── chat.service.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.routes.ts
│   │   │   ├── notifications.controller.ts
│   │   │   └── notifications.service.ts
│   │   │
│   │   └── ai/
│   │       ├── ai.routes.ts
│   │       ├── ai.controller.ts
│   │       └── ai.service.ts
│   │
│   ├── utils/
│   │   ├── jwt.utils.ts                # signToken, verifyToken
│   │   ├── response.utils.ts           # Standardni API response format
│   │   └── hash.utils.ts               # bcrypt helpers
│   │
│   └── types/
│       ├── express.d.ts                # Extend Request (req.user)
│       └── index.ts                    # Shared TypeScript tipovi
│
├── .env                                # Environment varijable
├── .env.example                        # Template za .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
