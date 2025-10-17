import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// 🟢 Create a new company
router.post("/", async (req, res) => {
  try {
    const company = await prisma.company.create({
      data: req.body,
    });
    res.status(201).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create company" });
  }
});

// 🔵 Get all companies
router.get("/", async (req, res) => {
  try {
    const companies = await prisma.company.findMany();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

// 🟣 Get a single company by ID
router.get("/:id", async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
    });
    if (!company) return res.status(404).json({ message: "Not found" });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch company" });
  }
});

// 🟠 Update a company
router.put("/:id", async (req, res) => {
  try {
    const updated = await prisma.company.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update company" });
  }
});

// 🔴 Delete a company
router.delete("/:id", async (req, res) => {
  try {
    await prisma.company.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete company" });
  }
});

export default router;
