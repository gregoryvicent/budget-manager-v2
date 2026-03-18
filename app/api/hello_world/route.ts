import { NextResponse } from "next/server";

export async function GET() {
	try {
		return NextResponse.json(
			{ status: "ok", message: "Hello World" },
			{ status: 200 }
		)
	} catch (error) {
		return NextResponse.json(
			{ status: "error", message: "Some problem" },
			{ status: 500 }
		)
	}
}