import { Router } from "express";
import { ADMIN_MAIL, RESEND_API_KEY, strapi, STRAPI_TOKEN, SUPPORT_MAIL } from "../../../config.js";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

const userRouter = Router();
const resend = new Resend(RESEND_API_KEY);

userRouter.get("/", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }

        const decoded = jwt.decode(token);
        if (!decoded?.id) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const userData = await strapi.get(
            `/users/${decoded.id}?populate=*`,
            {
                headers: {
                    Authorization: `Bearer ${STRAPI_TOKEN}`
                }
            }
        );

        if (!userData.data.isMember) {
            return res.json({
                id: userData.data.id,
                documentId: userData.data.documentId,
                username: userData.data.username,
                email: userData.data.email,
                provider: userData.data.provider,
                confirmed: userData.data.confirmed,
                blocked: userData.data.blocked,
                name: userData.data.name,
                address: userData.data.address,
                dob: userData.data.dob,
                phone: userData.data.phone,
                createdAt: userData.data.createdAt,
                updatedAt: userData.data.updatedAt,
                publishedAt: userData.data.publishedAt,
                isMember: userData.data.isMember,
            })
        }

        if (userData.data.isMember && !userData.data.membership.isVerified) {
            return res.json({
                id: userData.data.id,
                documentId: userData.data.documentId,
                username: userData.data.username,
                email: userData.data.email,
                provider: userData.data.provider,
                confirmed: userData.data.confirmed,
                blocked: userData.data.blocked,
                name: userData.data.name,
                address: userData.data.address,
                dob: userData.data.dob,
                phone: userData.data.phone,
                createdAt: userData.data.createdAt,
                updatedAt: userData.data.updatedAt,
                publishedAt: userData.data.publishedAt,
                isMember: userData.data.isMember,
                membership: {
                    isVerified: userData.data.membership.isVerified
                }
            })
        }
        res.json({
            id: userData.data.id,
            documentId: userData.data.documentId,
            username: userData.data.username,
            email: userData.data.email,
            provider: userData.data.provider,
            confirmed: userData.data.confirmed,
            blocked: userData.data.blocked,
            name: userData.data.name,
            address: userData.data.address,
            dob: userData.data.dob,
            phone: userData.data.phone,
            createdAt: userData.data.createdAt,
            updatedAt: userData.data.updatedAt,
            publishedAt: userData.data.publishedAt,
            isMember: userData.data.isMember,
            membership: {
                id: userData.data.membership.id,
                documentId: userData.data.membership.documentId,
                membership_id: userData.data.membership.membership_id,
                type: userData.data.membership.type,
                isVerified: userData.data.membership.isVerified,
                expiry: userData.data.membership.expiry,
                createdAt: userData.data.membership.createdAt,
                updatedAt: userData.data.membership.updatedAt,
                publishedAt: userData.data.membership.publishedAt,
                se_name: userData.data.membership.se_name,
                se_phone: userData.data.membership.se_phone,
                pr_facebook: userData.data.membership.pr_facebook,
                pr_instagram: userData.data.membership.pr_instagram,
                se_facebook: userData.data.membership.se_facebook,
                se_instagram: userData.data.membership.se_instagram,
                pr_profession: userData.data.membership.pr_profession,
                se_profession: userData.data.membership.se_profession,
                se_dob: userData.data.membership.se_dob,
                doa: userData.data.membership.doa
            }
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

userRouter.post("/member", async (req, res) => {
    try {
        const {
            type, // personal | couple
            se_name,
            se_phone,
            pr_facebook,
            pr_instagram,
            se_facebook,
            se_instagram,
            pr_profession,
            se_profession,
            mode_of_payment,
            transaction_details,
            reference,
            se_dob,
            doa,
        } = req.body;

        // Validation
        if (!type || !mode_of_payment || !transaction_details) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        if (type === "couple" && (!se_name || !se_phone)) {
            return res.status(400).json({
                message: "Secondary member details required for couple membership",
            });
        }

        // Auth
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }

        // Decode user id (frontend-issued JWT)
        const decoded = jwt.decode(token);
        if (!decoded?.id) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const userId = decoded.id;

        // Fetch user with membership
        const userRes = await strapi.get(`/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${STRAPI_TOKEN}`,
            },
            params: {
                populate: "membership",
            },
        });

        const user = userRes.data;

        if (user.membership) {
            return res.status(400).json({ message: "User already has a membership" });
        }

        // Generate membership ID + expiry
        const membership_id = `VCC-${new Date().getFullYear()}-${String(userId).padStart(3, "0")}`;
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const expiry = expiryDate.toISOString().split("T")[0]; // YYYY-MM-DD

        const formattedDoa = doa
            ? new Date(doa).toISOString().split("T")[0]
            : null;


        // CREATE MEMBERSHIP (NO user here)
        const membershipRes = await strapi.post(
            "/memberships",
            {
                data: {
                    membership_id,
                    type,
                    isVerified: false,
                    expiry,

                    se_name,
                    se_phone,
                    pr_facebook,
                    pr_instagram,
                    se_facebook,
                    se_instagram,
                    pr_profession,
                    se_profession,
                    mode_of_payment,
                    transaction_details,
                    reference,
                    se_dob: se_dob ? se_dob : null,
                    doa: formattedDoa,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${STRAPI_TOKEN}`,
                },
            }
        );

        const membershipId = membershipRes.data.data.id;

        // Update user
        await strapi.put(
            `/users/${userId}`,
            {
                isMember: true,
                membership: membershipId,
            },
            {
                headers: {
                    Authorization: `Bearer ${STRAPI_TOKEN}`,
                },
            }
        );

        const supportMail = await resend.emails.send({
            from: `ADMIN ACTION <${ADMIN_MAIL}>`,
            to: [SUPPORT_MAIL],
            subject: `MEMBERSHIP_MAIL: ${userId}`,
            html: `
                <h2>New Membership Mail</h2>
                <p><strong>User Id:</strong> ${userId}</p>
            `
        });



        return res.status(201).json({
            message: "Membership created successfully",
            membership_id,
        });
    } catch (err) {
        console.error(err?.response?.data || err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default userRouter;