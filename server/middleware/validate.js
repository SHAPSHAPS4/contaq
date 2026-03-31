/**
 * Request validation middleware using Zod schemas.
 * Usage: router.post('/endpoint', validate(schema), handler)
 */

const { z } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    req.validated = result.data;
    next();
  };
}

/* ── Schemas ─────────────────────────────────────────────────── */

const signupSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  trade: z.string().optional(),
  plan: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const inviteSchema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'manager', 'user']).optional().default('user'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Valid email required'),
});

const extractionSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.any(),
  })).optional(),
  model: z.string().optional(),
  max_tokens: z.number().positive().optional(),
  file_id: z.string().optional(),
  drawing_base64: z.string().optional(),
}).refine(
  data => data.messages || data.file_id || data.drawing_base64,
  { message: 'One of messages, file_id, or drawing_base64 is required' }
);

const takeoffSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.any(),
  })).optional(),
  drawing_extraction: z.any().optional(),
  spec_analysis: z.any().optional(),
  project_ref: z.string().optional(),
  model: z.string().optional(),
  max_tokens: z.number().positive().optional(),
  override_validation: z.boolean().optional(),
});

const pricingSchema = z.object({
  takeoff_items: z.array(z.object({
    description: z.string(),
    trade: z.string().optional(),
    quantity: z.number().optional(),
    unit: z.string().optional(),
  })).min(1, 'At least one takeoff item required'),
  overheads: z.object({
    labour_uplift_pct: z.number().optional(),
    material_uplift_pct: z.number().optional(),
    overhead_pct: z.number().optional(),
    profit_pct: z.number().optional(),
    contingency_pct: z.number().optional(),
  }).optional(),
  project_ref: z.string().optional(),
});

const feedbackSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.any(),
  })).optional(),
  corrections: z.array(z.object({
    item_index: z.number(),
    field: z.string(),
    original: z.any(),
    corrected: z.any(),
    comment: z.string().optional(),
  })).optional(),
  quote_ref: z.string().optional(),
  model: z.string().optional(),
});

const versionSaveSchema = z.object({
  quote_data: z.object({
    summary: z.any().optional(),
    priced_items: z.array(z.any()).optional(),
  }),
  change_note: z.string().optional(),
});

const similarityFindSchema = z.object({
  extraction_items: z.array(z.any()).min(1, 'At least one extraction item required'),
  limit: z.number().positive().optional().default(3),
});

const registerCreateSchema = z.object({
  project_ref: z.string().min(1, 'Project reference required'),
  drawings: z.array(z.object({
    file_id: z.string(),
    original_name: z.string(),
    size_label: z.string().optional(),
  })).min(1, 'At least one drawing required'),
});

module.exports = {
  validate,
  schemas: {
    signup: signupSchema,
    login: loginSchema,
    changePassword: changePasswordSchema,
    invite: inviteSchema,
    resetPassword: resetPasswordSchema,
    extraction: extractionSchema,
    takeoff: takeoffSchema,
    pricing: pricingSchema,
    feedback: feedbackSchema,
    versionSave: versionSaveSchema,
    similarityFind: similarityFindSchema,
    registerCreate: registerCreateSchema,
  }
};
