const express = require("express");
const { db } = require("../config/firebase");

const router = express.Router();

// Temporary OTP storage for prototype
const otpStore = new Map();

// SEND OTP
router.post("/send-otp", async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || !/^\d{10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Valid 10-digit mobile number is required."
            });
        }

        // Demo OTP for SIH prototype
        const otp = "1234";

        otpStore.set(phone, otp);

        console.log(`Demo OTP for ${phone}: ${otp}`);

        res.json({
            success: true,
            message: "OTP sent successfully.",
            demoOtp: otp
        });

    } catch (error) {
        console.error("Send OTP error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to send OTP."
        });
    }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone and OTP are required."
            });
        }

        const savedOtp = otpStore.get(phone);

        if (savedOtp !== otp) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP."
            });
        }

        otpStore.delete(phone);

        // Check whether user already exists
        const snapshot = await db
            .collection("users")
            .where("phone", "==", phone)
            .limit(1)
            .get();

        let user;

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];

            user = {
                id: doc.id,
                ...doc.data()
            };
        } else {
            // Create new user
            const newUser = {
                name: "",
                businessName: "",
                phone,
                language: "en",
                location: "India",
                createdAt: new Date()
            };

            const docRef = await db
                .collection("users")
                .add(newUser);

            user = {
                id: docRef.id,
                ...newUser
            };
        }

        res.json({
            success: true,
            message: "OTP verified successfully.",
            user
        });

    } catch (error) {
        console.error("Verify OTP error:", error);

        res.status(500).json({
            success: false,
            message: "OTP verification failed."
        });
    }
});

// REGISTER USER
router.post("/register", async (req, res) => {
    try {
        const {
            name,
            businessName,
            phone,
            language,
            location
        } = req.body;

        if (!name || !businessName || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name, business name and phone are required."
            });
        }

        const existing = await db
            .collection("users")
            .where("phone", "==", phone)
            .limit(1)
            .get();

        if (!existing.empty) {
            return res.status(409).json({
                success: false,
                message: "A user with this phone number already exists."
            });
        }

        const userData = {
            name,
            businessName,
            phone,
            language: language || "en",
            location: location || "India",
            createdAt: new Date()
        };

        const docRef = await db
            .collection("users")
            .add(userData);

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: {
                id: docRef.id,
                ...userData
            }
        });

    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed."
        });
    }
});

module.exports = router;