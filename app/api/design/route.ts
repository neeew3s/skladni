import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'design.json')

export async function GET() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    return NextResponse.json({})
  }
}

export async function POST(request: Request) {
  try {
    const content = await request.json()
    
    // Ensure directory exists
    const dir = path.dirname(DATA_FILE)
    try {
      await fs.access(dir)
    } catch {
      await fs.mkdir(dir, { recursive: true })
    }

    await fs.writeFile(DATA_FILE, JSON.stringify(content, null, 2), 'utf8')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save design settings:', error)
    return NextResponse.json({ error: 'Failed to save design settings' }, { status: 500 })
  }
}
