import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, ImageRun, ShadingType } from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import imageSize from 'image-size';

interface ReportData {
  client: string;
  site: string;
  technician: string;
  date: string;
  time: string;
  units: string;
  notes: string[];
  photos: Array<{ path: string; caption: string }>;
  intelligentSummary?: any;
  metadata?: {
    startTime?: string;
    scopeType?: string;
  };
}

/**
 * Calculate image dimensions preserving aspect ratio
 * @param imagePath Path to the image file
 * @param maxWidth Maximum width in pixels (default: 450)
 * @returns Object with width and height that preserve aspect ratio
 */
function getImageDimensions(imagePath: string, maxWidth: number = 450): { width: number; height: number } {
  try {
    // Read the image file as a buffer
    const imageBuffer = fs.readFileSync(imagePath);
    const dimensions = imageSize(imageBuffer);

    if (!dimensions.width || !dimensions.height) {
      return { width: maxWidth, height: Math.round(maxWidth * 0.75) }; // Default 4:3 ratio
    }

    const aspectRatio = dimensions.height / dimensions.width;
    const width = maxWidth;
    const height = Math.round(width * aspectRatio);

    return { width, height };
  } catch (error) {
    console.error(`Error getting image dimensions for ${imagePath}:`, error);
    return { width: maxWidth, height: Math.round(maxWidth * 0.75) }; // Default 4:3 ratio
  }
}

/**
 * Clean bullet point text by removing leading and trailing punctuation marks
 * @param text The bullet point text to clean
 * @returns Cleaned text without leading/trailing "-,. " characters
 */
function cleanBulletPoint(text: string): string {
  return text.trim()
    .replace(/^[.\-,\s]+/, '')  // Remove leading periods, dashes, commas, and spaces
    .replace(/[-,.]+$/, '')      // Remove trailing dashes, commas, and periods
    .trim();
}

/**
 * Spell-check and correct common photo caption errors
 * @param caption The original caption text
 * @returns Corrected caption with proper spelling
 */
function spellCheckCaption(caption: string): string {
  if (!caption) return caption;

  const normalized = caption.trim().toLowerCase();

  // Common typo corrections for photo categories
  const corrections: Record<string, string> = {
    'bfore': 'Before',
    'befroe': 'Before',
    'befor': 'Before',
    'beofre': 'Before',
    'afte': 'After',
    'ater': 'After',
    'aftr': 'After',
    'durring': 'During',
    'duirng': 'During',
    'dring': 'During',
    'covr': 'Cover',
    'cove': 'Cover',
    'coer': 'Cover',
    'finl': 'Final',
    'fianl': 'Final',
    'fnial': 'Final'
  };

  // Check if the caption matches a typo
  for (const [typo, correction] of Object.entries(corrections)) {
    if (normalized === typo) {
      return correction;
    }
  }

  // If caption exactly matches a category name, capitalize it properly
  const categories: Record<string, string> = {
    'before': 'Before',
    'after': 'After',
    'during': 'During',
    'cover': 'Cover',
    'final': 'Final'
  };

  if (categories[normalized]) {
    return categories[normalized];
  }

  // Return original caption if no corrections needed
  return caption;
}

export function professionalWordReportTemplate(data: ReportData): Document {
  
  const children: any[] = [];

  // TITLE: Flodraulic Engineering Field Report
  children.push(
    new Paragraph({
      text: 'Flodraulic',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: 'Engineering Field Report',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

   // METADATA TABLE (only show fields with data)
  const metadataRows: TableRow[] = [];

  if (data.client && data.client !== 'Client Name') {
    metadataRows.push(
      new TableRow({
        children: [
          new TableCell({ 
            children: [new Paragraph({ children: [new TextRun({ text: 'Client:', bold: true })] })] 
          }),
          new TableCell({ children: [new Paragraph({ text: data.client })] }),
        ],
      })
    );
  }

  if (data.site && data.site !== 'Site Location') {
    metadataRows.push(
      new TableRow({
        children: [
          new TableCell({ 
            children: [new Paragraph({ children: [new TextRun({ text: 'Site:', bold: true })] })] 
          }),
          new TableCell({ children: [new Paragraph({ text: data.site })] }),
        ],
      })
    );
  }

  if (data.technician && data.technician !== 'Field Technician') {
    metadataRows.push(
      new TableRow({
        children: [
          new TableCell({ 
            children: [new Paragraph({ children: [new TextRun({ text: 'Technician:', bold: true })] })] 
          }),
          new TableCell({ children: [new Paragraph({ text: data.technician })] }),
        ],
      })
    );
  }

  metadataRows.push(
    new TableRow({
      children: [
        new TableCell({ 
          children: [new Paragraph({ children: [new TextRun({ text: 'Date:', bold: true })] })] 
        }),
        new TableCell({ children: [new Paragraph({ text: data.date })] }),
      ],
    })
  );

  const timeValue = data.metadata?.startTime || data.time;
  metadataRows.push(
    new TableRow({
      children: [
        new TableCell({ 
          children: [new Paragraph({ children: [new TextRun({ text: 'Start Time:', bold: true })] })] 
        }),
        new TableCell({ children: [new Paragraph({ text: timeValue })] }),
      ],
    })
  );

  if (data.units && data.units !== 'Imperial') {
    metadataRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Units:', bold: true })] })]
          }),
          new TableCell({ children: [new Paragraph({ text: data.units })] }),
        ],
      })
    );
  }

  // Add metadata table to document
  if (metadataRows.length > 0) {
    children.push(
      new Table({
        rows: metadataRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
    children.push(new Paragraph({ text: '', spacing: { after: 300 } }));
  }

  // COVER PHOTO (First photo if available)
  if (data.photos && data.photos.length > 0) {
    const coverPhoto = data.photos[0];

    if (fs.existsSync(coverPhoto.path)) {
      try {
        const imageBuffer = fs.readFileSync(coverPhoto.path);
        const { width, height } = getImageDimensions(coverPhoto.path, 450);

        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: width,
                  height: height,
                },
                type: 'jpg',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
          })
        );

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: spellCheckCaption(coverPhoto.caption) || 'Cover Photo',
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          })
        );
      } catch (error) {
        console.error(`Error loading cover photo ${coverPhoto.path}:`, error);
      }
    }
  }

  // EXECUTIVE SUMMARY (as bullet points)
  children.push(
    new Paragraph({
      text: 'Executive Summary',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 200 },
    })
  );

  const summaryText = data.intelligentSummary?.executiveSummary ||
                      (data.notes.length > 0 ? data.notes[0] : 'No summary available.');

  // Split summary into bullet points if it's a string
  const summaryArray = typeof summaryText === 'string'
    ? summaryText.split(/[.;]\s+/).filter(s => s.trim().length > 0).map(s => cleanBulletPoint(s))
    : Array.isArray(summaryText) ? summaryText.map(s => cleanBulletPoint(s)) : [cleanBulletPoint(summaryText)];

  summaryArray.forEach((item: string) => {
    if (item.trim().length > 0) {
      children.push(
        new Paragraph({
          text: item,
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    }
  });

  children.push(new Paragraph({ text: '', spacing: { after: 300 } }));

  // SCOPE (as bullet points)
  children.push(
    new Paragraph({
      text: 'Scope',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 200 },
    })
  );

  const scopeText = data.intelligentSummary?.scopeDescription ||
                    'This report documents site conditions, work performed, and recommendations.';

  // Split scope into bullet points if it's a string
  const scopeArray = typeof scopeText === 'string'
    ? scopeText.split(/[.;]\s+/).filter(s => s.trim().length > 0).map(s => cleanBulletPoint(s))
    : Array.isArray(scopeText) ? scopeText.map(s => cleanBulletPoint(s)) : [cleanBulletPoint(scopeText)];

  scopeArray.forEach((item: string) => {
    if (item.trim().length > 0) {
      children.push(
        new Paragraph({
          text: item,
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    }
  });

  children.push(new Paragraph({ text: '', spacing: { after: 300 } }));

  // SITE CONDITIONS (as bullet points)
  children.push(
    new Paragraph({
      text: 'Site Conditions',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 200 },
    })
  );

  const siteConditionsText = data.intelligentSummary?.siteConditions ||
                             'No specific site conditions documented.';

  // Split site conditions into bullet points if it's a string
  const siteConditionsArray = typeof siteConditionsText === 'string'
    ? siteConditionsText.split(/[.;]\s+/).filter(s => s.trim().length > 0).map(s => cleanBulletPoint(s))
    : Array.isArray(siteConditionsText) ? siteConditionsText.map(s => cleanBulletPoint(s)) : [cleanBulletPoint(siteConditionsText)];

  siteConditionsArray.forEach((item: string) => {
    if (item.trim().length > 0) {
      children.push(
        new Paragraph({
          text: item,
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    }
  });

  children.push(new Paragraph({ text: '', spacing: { after: 300 } }));

  // WORK PERFORMED (Completed and Verified)
  children.push(
    new Paragraph({
      text: data.intelligentSummary?.workPerformedStructured && data.intelligentSummary.workPerformedStructured.length > 0
        ? 'Work Performed (Completed and Verified)'
        : 'Work Performed',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 200 },
    })
  );

  if (data.intelligentSummary?.workPerformedStructured && data.intelligentSummary.workPerformedStructured.length > 0) {
    data.intelligentSummary.workPerformedStructured.forEach((item: string) => {
      const cleanedItem = cleanBulletPoint(item);
      if (cleanedItem.trim().length > 0) {
        children.push(
          new Paragraph({
            text: cleanedItem,
            bullet: { level: 0 },
            spacing: { after: 100 },
          })
        );
      }
    });
  } else {
    // Fallback to notes if no intelligent summary
    data.notes.forEach((note) => {
      const cleanedNote = cleanBulletPoint(note);
      if (cleanedNote.trim().length > 0) {
        children.push(
          new Paragraph({
            text: cleanedNote,
            bullet: { level: 0 },
            spacing: { after: 100 },
          })
        );
      }
    });
  }

  children.push(new Paragraph({ text: '', spacing: { after: 300 } }));

  // VERIFICATION AND TESTING (NEW SECTION)
  if (data.intelligentSummary?.verificationMethods &&
      data.intelligentSummary.verificationMethods.length > 0 &&
      data.intelligentSummary.verificationMethods[0] !== 'No verification testing documented') {
    children.push(
      new Paragraph({
        text: 'Verification and Testing',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      })
    );

    data.intelligentSummary.verificationMethods.forEach((method: string) => {
      const cleanedMethod = cleanBulletPoint(method);
      if (cleanedMethod.trim().length > 0) {
        children.push(
          new Paragraph({
            text: cleanedMethod,
            bullet: { level: 0 },
            spacing: { after: 100 },
          })
        );
      }
    });

    children.push(new Paragraph({ text: '', spacing: { after: 300 } }));
  }

  // WORK IN PROGRESS (NEW SECTION)
  if (data.intelligentSummary?.workInProgress && data.intelligentSummary.workInProgress.length > 0) {
    children.push(
      new Paragraph({
        text: 'Work In Progress',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      })
    );

    data.intelligentSummary.workInProgress.forEach((item: string) => {
      const cleanedItem = cleanBulletPoint(item);
      if (cleanedItem.trim().length > 0) {
        children.push(
          new Paragraph({
            text: cleanedItem,
            bullet: { level: 0 },
            spacing: { after: 100 },
          })
        );
      }
    });

    children.push(new Paragraph({ text: '', spacing: { after: 300 } }));
  }

  // REQUIRED CORRECTIVE ACTIONS (NEW SECTION)
  if (data.intelligentSummary?.requiredCorrectiveActions && data.intelligentSummary.requiredCorrectiveActions.length > 0) {
    children.push(
      new Paragraph({
        text: 'Required Corrective Actions (Not Yet Started)',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      })
    );

    data.intelligentSummary.requiredCorrectiveActions.forEach((action: string) => {
      const cleanedAction = cleanBulletPoint(action);
      if (cleanedAction.trim().length > 0) {
        children.push(
          new Paragraph({
            text: cleanedAction,
            bullet: { level: 0 },
            spacing: { after: 100 },
          })
        );
      }
    });

    children.push(new Paragraph({ text: '', spacing: { after: 300 } }));
  }

  // FINAL RESULTS (as bullet points)
  children.push(
    new Paragraph({
      text: 'Final Results',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 200 },
    })
  );

  const finalResultsText = data.intelligentSummary?.finalResults ||
                           'Inspection completed. Data collected for analysis and planning.';

  // Split final results into bullet points if it's a string
  const finalResultsArray = typeof finalResultsText === 'string'
    ? finalResultsText.split(/[.;]\s+/).filter(s => s.trim().length > 0).map(s => cleanBulletPoint(s))
    : Array.isArray(finalResultsText) ? finalResultsText.map(s => cleanBulletPoint(s)) : [cleanBulletPoint(finalResultsText)];

  finalResultsArray.forEach((result: string) => {
    if (result.trim().length > 0) {
      children.push(
        new Paragraph({
          text: result,
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    }
  });

  children.push(new Paragraph({ text: '', spacing: { after: 300 } }));

  // PHOTO DOCUMENTATION (Skip first photo as it's the cover photo)
  if (data.photos && data.photos.length > 1) {
    children.push(
      new Paragraph({
        text: 'Photo Documentation',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      })
    );

    // Start from index 1 to skip the cover photo
    data.photos.slice(1).forEach((photo, index) => {
      children.push(
        new Paragraph({
          text: `Photo ${index + 2}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      if (fs.existsSync(photo.path)) {
        try {
          const imageBuffer = fs.readFileSync(photo.path);
          const { width, height } = getImageDimensions(photo.path, 450);

          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: width,
                    height: height,
                  },
                  type: 'jpg',
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            })
          );
        } catch (error) {
          console.error(`Error loading image ${photo.path}:`, error);
        }
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: spellCheckCaption(photo.caption) || 'No caption provided',
              italics: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      );
    });
  }

  // RECOMMENDATIONS
  children.push(
    new Paragraph({
      text: 'Recommendations',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 200 },
    })
  );

  const recommendations = data.intelligentSummary?.intelligentRecommendations || [
    'Review parts inventory for critical spares',
    'Schedule preventive maintenance based on manufacturer guidance',
  ];

  recommendations.forEach((rec: string) => {
    const cleanedRec = cleanBulletPoint(rec);
    if (cleanedRec.trim().length > 0) {
      children.push(
        new Paragraph({
          text: cleanedRec,
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    }
  });

  children.push(new Paragraph({ text: '', spacing: { after: 400 } }));

  // FOOTER
  const timestamp = new Date().getTime();
  const dateStr = new Date().toISOString().split('T')[0];
  const reportId = `FR-${dateStr}-${timestamp}`;
  
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Report generated by Flodraulic Field Report Bot • ${data.date} ${timeValue}`,
          size: 18,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Report ID: ${reportId}`,
          size: 18,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Confidential - For authorized personnel only',
          size: 16,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  return new Document({
    sections: [
      {
        children: children,
      },
    ],
  });
}
