ALTER TABLE `creditLedger` ADD CONSTRAINT `credits_request_unique_idx` UNIQUE(`userId`,`requestId`);
