CREATE TABLE "reservation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid,
	"product_variant_id" uuid NOT NULL,
	"product_variant_size_id" uuid,
	"quantity" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "reservation" ADD CONSTRAINT "reservation_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_product_variant_id_product_variant_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_product_variant_size_id_product_variant_size_id_fk" FOREIGN KEY ("product_variant_size_id") REFERENCES "public"."product_variant_size"("id") ON DELETE set null ON UPDATE no action;
