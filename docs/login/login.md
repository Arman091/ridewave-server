# Backend Auth Flow (Express + Mongoose)

## 1️⃣ Email + Password Login Flow

```
        ┌───────────────────────┐
        │ client (frontend)     │
        │ POST /api/auth/login  │
        │ { email, password }   │
        └─────────┬─────────────┘
                  │
                  ▼
        ┌───────────────────────┐
        │ routes/auth.js        │
        │ router.post("/login") │
        └─────────┬─────────────┘
                  │
                  ▼
        ┌───────────────────────────┐
        │ controllers/authController │
        │ login()                   │
        │ 1. User.findOne(email)    │
        │ 2. bcrypt.compare()       │
        │ 3. jwt.sign() access+ref. │
        └─────────┬─────────────────┘
                  │
                  ▼
        ┌───────────────────────┐
        │ MongoDB (User model)  │
        │ user.refreshToken=... │
        │ user.save()           │
        └─────────┬─────────────┘
                  │
                  ▼
        ┌─────────────────────────┐
        │ Response → client        │
        │ { accessToken,           │
        │   refreshToken, user }   │
        └─────────────────────────┘
```

## 2️⃣ Phone + OTP Login Flow (planned)

#### We’ll need two endpoints:

**-POST /api/auth/send-otp**

**-POST /api/auth/verify-otp**

```
Step A: Request OTP
──────────────────────────
Client → POST /send-otp { phone }

        ┌───────────────────────────┐
        │ routes/auth.js            │
        │ router.post("/send-otp")  │
        └─────────┬─────────────────┘
                  │
                  ▼
        ┌───────────────────────────┐
        │ controllers/authController │
        │ sendOTP()                 │
        │ 1. generate random OTP    │
        │ 2. save OTP in DB/Redis   │
        │ 3. send SMS (mock/log)    │
        └─────────┬─────────────────┘
                  │
                  ▼
        ┌───────────────────────────┐
        │ Response → client          │
        │ { msg: "OTP sent" }        │
        └───────────────────────────┘


Step B: Verify OTP
──────────────────────────
Client → POST /verify-otp { phone, otp }

        ┌───────────────────────────┐
        │ routes/auth.js            │
        │ router.post("/verify-otp")│
        └─────────┬─────────────────┘
                  │
                  ▼
        ┌───────────────────────────┐
        │ controllers/authController │
        │ verifyOTP()               │
        │ 1. check otp in DB        │
        │ 2. if valid:              │
        │    - find/create user     │
        │    - issue JWT            │
        └─────────┬─────────────────┘
                  │
                  ▼
        ┌───────────────────────────┐
        │ MongoDB (User model)      │
        │ if new user → save record │
        └─────────┬─────────────────┘
                  │
                  ▼
        ┌───────────────────────────┐
        │ Response → client          │
        │ { accessToken, user }      │
        └───────────────────────────┘
```