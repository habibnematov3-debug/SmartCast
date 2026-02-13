-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Screen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationId" TEXT NOT NULL,
    "totalSlots" INTEGER NOT NULL DEFAULT 18,
    "loopSeconds" INTEGER NOT NULL DEFAULT 60,
    "adSeconds" INTEGER NOT NULL DEFAULT 10,
    CONSTRAINT "Screen_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Screen" ("adSeconds", "id", "locationId", "loopSeconds", "totalSlots") SELECT "adSeconds", "id", "locationId", "loopSeconds", "totalSlots" FROM "Screen";
DROP TABLE "Screen";
ALTER TABLE "new_Screen" RENAME TO "Screen";
CREATE UNIQUE INDEX "Screen_locationId_key" ON "Screen"("locationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
