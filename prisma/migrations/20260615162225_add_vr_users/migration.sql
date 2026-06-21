-- CreateTable
CREATE TABLE "vr_users" (
    "id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vr_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vr_users_username_org_id_key" ON "vr_users"("username", "org_id");

-- AddForeignKey
ALTER TABLE "vr_users" ADD CONSTRAINT "vr_users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
