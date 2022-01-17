"use strict";

const Company = require("../models/company");
const generator = require("generate-password");

exports.listAllCompanies = async (req, res) => {
    let { keyword, role, limit, skip } = req.query;
    limit = +limit <= 100 ? +limit : 20;
    skip = +skip || 0;
    let query = {},
        regexKeyword;
    role ? (query["role"] = role.toUpperCase()) : "";
    keyword && /\w/.test(keyword)
        ? (regexKeyword = new RegExp(keyword, "i"))
        : "";
    regexKeyword ? (query["name"] = regexKeyword) : "";
    const companies = await Company.find(query).limit(limit).skip(skip);
    res.json(companies);
};

exports.createNewCompany = async (req, res) => {
    let password = generator.generate({
        length: 10,
        numbers: true,
    });
    const data = { password, ...req.body };
    const newCompany = new Company(data);
    try {
        const result = await newCompany.save();
        res.json(result);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
