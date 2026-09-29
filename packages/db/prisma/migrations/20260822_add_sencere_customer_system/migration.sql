-- CreateTable SenCereCustomer
CREATE TABLE "SenCereCustomer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "newsletter" BOOLEAN NOT NULL DEFAULT false,
    "communicationPreference" TEXT NOT NULL DEFAULT 'email',
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SenCereCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable SenCereOrder
CREATE TABLE "SenCereOrder" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "shippingAddress" JSONB,
    "shippingMethod" TEXT,
    "trackingNumber" TEXT,
    "estimatedCompletionDate" TIMESTAMP(3),
    "actualCompletionDate" TIMESTAMP(3),
    "productionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SenCereOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable SenCereOrderItem
CREATE TABLE "SenCereOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "variantName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SenCereOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SenCereCustomer_userId_key" ON "SenCereCustomer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SenCereCustomer_email_key" ON "SenCereCustomer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SenCereCustomer_stripeCustomerId_key" ON "SenCereCustomer"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "SenCereCustomer_userId_idx" ON "SenCereCustomer"("userId");

-- CreateIndex
CREATE INDEX "SenCereCustomer_email_idx" ON "SenCereCustomer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SenCereOrder_orderNumber_key" ON "SenCereOrder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SenCereOrder_stripeCheckoutSessionId_key" ON "SenCereOrder"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "SenCereOrder_customerId_idx" ON "SenCereOrder"("customerId");

-- CreateIndex
CREATE INDEX "SenCereOrder_orderNumber_idx" ON "SenCereOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "SenCereOrder_status_idx" ON "SenCereOrder"("status");

-- CreateIndex
CREATE INDEX "SenCereOrder_createdAt_idx" ON "SenCereOrder"("createdAt");

-- CreateIndex
CREATE INDEX "SenCereOrderItem_orderId_idx" ON "SenCereOrderItem"("orderId");

-- AddForeignKey
ALTER TABLE "SenCereCustomer" ADD CONSTRAINT "SenCereCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SenCereOrder" ADD CONSTRAINT "SenCereOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "SenCereCustomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SenCereOrderItem" ADD CONSTRAINT "SenCereOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SenCereOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
