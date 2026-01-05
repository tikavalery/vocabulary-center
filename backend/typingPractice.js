const express = require("express")
const mongoose = require("mongoose");
const dotenv = require("dotenv")
const User = require("./models/User")
const PDF = require("./models/PDF")

dotenv.config();

const samplePDF = [
{
    title: "Spanish Vocabulary Essentials",
    language: "Spanish",
    price: 9.99,
    description:"Comprehensive Spanish vocabulary guide with 1000 + essential",
    coverImageUrl: "https://images.unsplash.com/photo-1500321111",
    pdfFileUrl:"https://example.com/spanish-vocab.pdf"

},{
    title:"French Language Mastery",
    language:"French",
    price:12.99,
    description: "Master French vocabulary with this detialed guide covering ",
    coverImageUrl:"https://images.unsplash.com/photo-150070032111169",
    pdfFileUrl:"https://example.com/french-vocab.pdf"
},
{title:"Italian Conversational Guide",
    language:"Italian",
    price:8.99,
    description:"Learn Italian through practical vocabulary organized by topic",
    coverImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd722899",
    pdfFileUrl:"https://example.com/italian-vocab.pdf"
}
]