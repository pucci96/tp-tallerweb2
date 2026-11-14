-- CreateTable
CREATE TABLE "Comentario" (
    "id" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "texto" VARCHAR(500) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Comentario_id_producto_id_usuario_key" ON "Comentario"("id_producto", "id_usuario");

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
