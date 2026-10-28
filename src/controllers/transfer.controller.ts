import type { Request, Response } from 'express';
import { transferService } from '../services/transfer.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import type { CreateTransferInput } from '../validators/transfer.validator.js';

// Transfer requests are validated by middleware before they reach here, so the
// controller can focus entirely on orchestration and response formatting.
export const createTransfer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const input = req.body as CreateTransferInput;

  const transfer = await transferService.transfer(input);

  res.status(201).json({
    success: true,
    data: transfer
  });
});
