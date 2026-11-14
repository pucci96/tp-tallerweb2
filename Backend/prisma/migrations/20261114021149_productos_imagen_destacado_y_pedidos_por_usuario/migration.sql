/*
  Warnings:

  - Added the required column `id_usuario` to the `Pedido` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_id_categoria_fkey";

-- DropIndex
DROP INDEX "Producto_id_categoria_key";

-- DropIndex
DROP INDEX "Producto_id_subcategoria_key";

-- DropIndex
DROP INDEX "Subcategoria_id_categoria_key";

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "id_usuario" INTEGER NOT NULL,
ALTER COLUMN "fecha" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "estado" SET DEFAULT 'carrito';

-- AlterTable
ALTER TABLE "Pedido_productos" ADD COLUMN     "cantidad" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "destacado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "imagen" TEXT;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_id_subcategoria_fkey" FOREIGN KEY ("id_subcategoria") REFERENCES "Subcategoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
