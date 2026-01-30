-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "isGhost" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Post_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("authorType", "content", "createdAt", "expiresAt", "id", "threadId") SELECT "authorType", "content", "createdAt", "expiresAt", "id", "threadId" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE INDEX "Post_threadId_createdAt_idx" ON "Post"("threadId", "createdAt");
CREATE INDEX "Post_threadId_isGhost_idx" ON "Post"("threadId", "isGhost");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
