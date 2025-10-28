"use client";

export async function createUser(formData: FormData) {
  try {
    // prevent duplicate user as long as first name, last name, and DOB are the same
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const DOB = formData.get("DOB") as string;
    const user = await prisma.user.findMany({
      where: {
        firstName,
        lastName,
        DOB,
      },
      select: {
        id: true,
      },
    });

    if (user.length > 0) {
      return;
    }

    await prisma.user.create({
      data: {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        DOB: formData.get("DOB") as string,
        truckView: Boolean(formData.get("truckView")) as unknown as boolean,
        tascoView: Boolean(formData.get("tascoView")) as unknown as boolean,
        laborView: Boolean(formData.get("laborView")) as unknown as boolean,
        mechanicView: Boolean(
          formData.get("mechanicView")
        ) as unknown as boolean,
        permission: formData.get("permission") as Permission,
        image: formData.get("image") as string,
        Company: { connect: { id: "1" } },
      },
    });
  } catch (error) {
    console.error(error);
  }
  revalidatePath("/");
}

// this creates a user from the admin view
export async function adminCreateUser(formData: FormData) {
  try {
    // Extract data from form
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const DOB = formData.get("DOB") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!firstName || !lastName || !email || !password || !DOB) {
      throw new Error("Required fields are missing.");
    }

    // Check for duplicate user based on firstName, lastName, and DOB
    const user = await prisma.user.findMany({
      where: {
        firstName,
        lastName,
        DOB,
      },
      select: {
        id: true,
      },
    });

    if (user.length > 0) {
      return;
    }

    // Check for duplicate email
    const existingEmailUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmailUser) {
      return;
    }

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username: formData.get("username") as string,
        email,
        password: formData.get("password") as string,
        DOB,
        truckView: formData.get("truckView") === "true",
        tascoView: formData.get("tascoView") === "true",
        laborView: formData.get("laborView") === "true",
        mechanicView: formData.get("mechanicView") === "true",
        permission: formData.get("permission") as Permission,
        image: formData.get("image") as string,
        Company: { connect: { id: "1" } },
      },
    });
    const employeeId = newUser.id;

    // Create contact details
    await prisma.contacts.create({
      data: {
        userId: employeeId,
        phoneNumber: formData.get("phoneNumber") as string,
        emergencyContact: formData.get("emergencyContact") as string,
        emergencyContactNumber: formData.get(
          "emergencyContactNumber"
        ) as string,
      },
    });

    // Create user settings
    await prisma.userSettings.create({
      data: {
        userId: employeeId,
        language: "en",
        personalReminders: formData.get("personalReminders") === "true",
        generalReminders: formData.get("GeneralReminders") === "true",
        cameraAccess: formData.get("cameraAccess") === "false",
        locationAccess: formData.get("locationAccess") === "false",
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
  }
  revalidatePath("/");
}

export async function updateUser(formData: FormData) {
  await prisma.user.update({
    where: { id: formData.get("id") as string },
    data: {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      username: formData.get("username") as string,
      DOB: formData.get("DOB") as string,
      truckView: formData.get("truckView") === "true",
      tascoView: formData.get("tascoView") === "true",
      laborView: formData.get("laborView") === "true",
      mechanicView: formData.get("mechanicView") === "true",
      permission: formData.get("permission") as Permission,
      image: formData.get("image") as string,
    },
  });
}
export async function updateUserProfile(formData: FormData) {
  try {
    await prisma.user.update({
      where: { id: formData.get("id") as string },
      data: {
        email: formData.get("email") as string,
        Contact: {
          update: {
            phoneNumber: formData.get("phoneNumber") as string,
            emergencyContact: formData.get("emergencyContact") as string,
            emergencyContactNumber: formData.get(
              "emergencyContactNumber"
            ) as string,
          },
        },
      },
    });
    revalidatePath("/hamburger/profile");
  } catch (error) {
    console.error("Error updating user:", error);
  }
}

export async function deleteUser(formData: FormData) {
  const date = new Date();
  const id = formData.get("id") as string;
  await prisma.user.update({
    where: { id },
    data: {
      terminationDate: date.toISOString(),
    },
  });
}

export async function uploadImage(formdata: FormData) {
  await prisma.user.update({
    where: { id: formdata.get("id") as string },
    data: {
      image: formdata.get("image") as string,
    },
  });
  revalidatePath("/hamburger/profile");
}

export async function uploadFirstImage(formdata: FormData) {
  await prisma.user.update({
    where: { id: formdata.get("id") as string },
    data: {
      image: formdata.get("image") as string,
    },
  });
}

export async function uploadFirstSignature(formdata: FormData) {
  await prisma.user.update({
    where: { id: formdata.get("id") as string },
    data: {
      signature: formdata.get("signature") as string,
    },
  });
}

export async function uploadSignature(id: string, signature: string) {
  await prisma.user.update({
    where: { id: id },
    data: {
      signature: signature,
    },
  });
}

export async function setUserSettings(formdata: FormData) {
  await prisma.userSettings.update({
    where: { userId: formdata.get("id") as string },
    data: {
      personalReminders: formdata.get("personalReminders") === "true",
      generalReminders: formdata.get("generalReminders") === "true",
    },
  });
}

export async function setUserPermissions(formdata: FormData) {
  await prisma.userSettings.update({
    where: { userId: formdata.get("id") as string },
    data: {
      cameraAccess: Boolean(formdata.get("cameraAccess") as string),
      locationAccess: Boolean(formdata.get("locationAccess") as string),
      personalReminders: Boolean(formdata.get("personalReminders") as string),
      generalReminders: Boolean(formdata.get("generalReminders") as string),
      cookiesAccess: Boolean(formdata.get("cookiesAccess") as string),
    },
  });
}

export async function setUserLanguage(formdata: FormData) {
  const result = await prisma.userSettings.update({
    where: { userId: formdata.get("id") as string },
    data: {
      language: formdata.get("language") as string,
    },
  });
  return result.language;
}

export async function getUserFromDb(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
      password: password,
    },
  });
  if (user) {
    if (await compare(password, user.password)) {
      return user;
    }
  }
  return null;
}

export async function finishUserSetup(id: string) {
  await prisma.user.update({
    where: { id: id },
    data: {
      accountSetup: true,
    },
  });
}

export async function updateContactInfo(formData: FormData) {
  await prisma.contacts.update({
    where: { id: formData.get("id") as string },
    data: {
      phoneNumber: formData.get("phoneNumber") as string,
      emergencyContact: formData.get("emergencyContact") as string,
      emergencyContactNumber: formData.get("emergencyContactNumber") as string,
    },
  });

  revalidatePath("/admins");
  return true;
}

// email: "",
//   phoneNumber: "",
//   date: undefined as Date | undefined,
//   language: "",
//   emergencyContactName: "",
//   emergencyContactPhone: "",
export default async function updateUserAccountInfo(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    await prisma.user.update({
      where: { id },
      data: {
        email: formData.get("email") as string,
        DOB: formData.get("DOB") as string,
        Contact: {
          update: {
            phoneNumber: formData.get("phoneNumber") as string,
            emergencyContact: formData.get("emergencyContact") as string,
            emergencyContactNumber: formData.get(
              "emergencyContactNumber"
            ) as string,
          },
        },
        UserSettings: {
          update: { language: formData.get("language") as string },
        },
      },
    });

    // Implement the update logic here
    return true;
  } catch (error) {
    console.error("Error updating user account info:", error);
    return false;
  }
}

// Update user image URL in the database via API
export async function updateUserImage(id: string, imageUrl: string) {
  try {
    if (!id || !imageUrl) {
      throw new Error("Invalid credentials");
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(`${API_URL}/api/v1/user/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ image: imageUrl }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user image: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user image URL:", error);
    return { success: false };
  }
}
