import express from 'express'
import protect from '../middleware/auth.js'
import { getDashboard } from '../controllers/progressController.js'

const router = express.Router()

router.use(protect)

router.get('/dashboard', getDashboard)

export default router