"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type CompanyFormState = { error?: string; success?: boolean } | undefined;

export async function createCompany(_prevState: CompanyFormState, formData: FormData) {
  await requireUser("ADMIN");

  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("code") as string)?.trim();

  if (!name) {
    return { error: "Company name is required." };
  }

  const existing = await prisma.company.findFirst({ where: { name } });
  if (existing) {
    return { error: "A company with this name already exists." };
  }

  await prisma.company.create({
    data: { name, code: code || null },
  });

  revalidatePath("/admin/companies");
  return { success: true };
}

export async function setCompanyActive(companyId: string, active: boolean) {
  await requireUser("ADMIN");
  await prisma.company.update({ where: { id: companyId }, data: { active } });
  revalidatePath("/admin/companies");
}
