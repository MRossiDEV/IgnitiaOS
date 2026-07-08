// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

// ============================================================================
// GET - LIST USERS
// GET /api/admin/users
// ============================================================================

export async function GET(req: NextRequest) {
  try {

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")


    if (error) {
      console.error("SUPABASE ERROR:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      users: data ?? [],
      
    })
  } catch (error) {
    console.error("GET USERS ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// CREATE USER
// POST /api/admin/users
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      organizationId,
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      avatarUrl,
      isActive = true,
    } = body

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      )
    }

    // =====================================================
    // CHECK DUPLICATE EMAIL
    // =====================================================

    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      )
    }

    // =====================================================
    // CREATE AUTH USER
    // =====================================================

    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

    if (authError) throw authError

    // =====================================================
    // CREATE PROFILE
    // =====================================================

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert({
        id: authUser.user.id,
        organization_id: organizationId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        avatar_url: avatarUrl,
        role: role || "user",
        is_active: isActive,
      })
      .select()
      .single()

    if (error) {
      await supabaseAdmin.auth.admin.deleteUser(
        authUser.user.id
      )

      throw error
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("CREATE USER ERROR:", error)

    return NextResponse.json(
      {
        error: "Failed to create user",
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE USER
// DELETE /api/admin/users/:id
// ============================================================================

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("id")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // =====================================================
    // DELETE AUTH USER
    // =====================================================

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    )

    if (authError) throw authError

    // =====================================================
    // DELETE PROFILE
    // =====================================================
    
    const { error } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId)
    
    if (error) throw error

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("DELETE USER ERROR:", error)
    return NextResponse.json(
      {
        error: "Failed to delete user",
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// UPDATE USER
// PATCH /api/admin/users/:id
// ============================================================================

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("id")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const body = await req.json()

    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      avatarUrl,
      isActive,
    } = body

// =====================================================
    // UPDATE AUTH USER
// =====================================================
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email,
        password,
        email_confirm: true,
      }
    )

    if (authError) throw authError

    // =====================================================
    // UPDATE PROFILE
    // =====================================================
    
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        role: role,
        phone: phone,
        avatar_url: avatarUrl,
        is_active: isActive,
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json( 
      {
        user: user,
      }
    )
  } catch (error) {
    console.error("UPDATE USER ERROR:", error)
    return NextResponse.json(
      {
        error: "Failed to update user",
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET USER BY ID
// GET /api/admin/users/:id
// ============================================================================

export async function GET_USER_BY_ID(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("id")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select()
      .eq("id", userId)
      .single()

    if (error) throw error

    return NextResponse.json({ user })
  } catch (error) {
    console.error("GET USER BY ID ERROR:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch user",
      },
      { status: 500 }
    )
  }
}