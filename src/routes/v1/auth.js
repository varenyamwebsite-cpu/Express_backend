import { Router } from "express";
import { getUsername } from "../../utils/getUsername.js"
import { strapi, STRAPI_TOKEN } from "../../../config.js";

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
    const { email, password, name, address, dob, phone } = req.body;

    if (!email || !password || !name || !address || !dob || !phone) {
        return res.status(400).json({
            msg: "all the fields are required"
        })
    }

    const username = getUsername(name);

    try {
        const strapiRes = await strapi.post("/auth/local/register", {
            username,
            email,
            password
        })

        const userData = strapiRes.data;

        const extraRes = await strapi.put(`/users/${userData.user.id}`, {
            name: name,
            address: address,
            dob: dob,
            phone: phone
        }, {
            headers: {
                Authorization: `Bearer ${STRAPI_TOKEN}`
            }
        });

        return res.status(200).json({
            msg: "user registered successfully",
            jwt: userData.jwt,
            user: extraRes.data
        })
    } catch (err) {
        console.log(err)
        if (err.status) {
            return res.status(err.status).json({
                msg: err.message
            });
        }
        return res.status(500).json({
            msg: "internal server error"
        })
    }
})

export default authRouter;
