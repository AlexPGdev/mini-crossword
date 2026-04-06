-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "checkGridCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "revealedLetterCount" INTEGER NOT NULL DEFAULT 0;
