import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { AssessmentResultPayload } from "@/lib/assessment-results";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    color: "#173244",
    backgroundColor: "#f8fafc"
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#dbe3ea"
  },
  brand: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#1BA38E",
    textTransform: "uppercase",
    marginBottom: 8
  },
  title: {
    fontSize: 24,
    color: "#244566",
    fontWeight: 700
  },
  subtitle: {
    marginTop: 8,
    fontSize: 10,
    color: "#4f646d",
    lineHeight: 1.5
  },
  scoreRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18
  },
  scoreCard: {
    width: "30%",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#e9f5f4"
  },
  scoreValue: {
    fontSize: 32,
    color: "#244566",
    fontWeight: 700
  },
  scoreLabel: {
    marginTop: 4,
    fontSize: 9,
    letterSpacing: 1.4,
    color: "#1BA38E",
    textTransform: "uppercase"
  },
  summaryCard: {
    width: "70%",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff"
  },
  section: {
    marginTop: 18
  },
  sectionLabel: {
    fontSize: 9,
    letterSpacing: 1.6,
    color: "#1BA38E",
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: 700
  },
  sectionTitle: {
    fontSize: 16,
    color: "#244566",
    fontWeight: 700,
    marginBottom: 8
  },
  body: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#4f646d"
  },
  actionGrid: {
    gap: 8
  },
  actionItem: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderLeftWidth: 4,
    borderLeftColor: "#1BA38E"
  },
  domainCard: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff"
  },
  domainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  domainTitle: {
    fontSize: 12,
    color: "#173244",
    fontWeight: 700
  },
  domainScore: {
    fontSize: 11,
    color: "#1BA38E",
    fontWeight: 700
  },
  bulletRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 5
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 5,
    backgroundColor: "#1BA38E"
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.4,
    color: "#4f646d"
  },
  disclaimer: {
    marginTop: 18,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    fontSize: 8,
    lineHeight: 1.45,
    color: "#6f7f86"
  }
});

function formatLeadName(result: AssessmentResultPayload) {
  return [result.lead?.firstName, result.lead?.lastName].filter(Boolean).join(" ") || "Assessment participant";
}

function AssessmentReportDocument({ result }: { result: AssessmentResultPayload }) {
  return (
    <Document
      title={`AI Readiness Assessment - ${result.lead?.company ?? formatLeadName(result)}`}
      author="Kona Kai Corporation"
      subject="AI Readiness Assessment Report"
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Kona Kai Corporation</Text>
          <Text style={styles.title}>AI Readiness Assessment Report</Text>
          <Text style={styles.subtitle}>
            Prepared for {formatLeadName(result)}
            {result.lead?.company ? `, ${result.lead.company}` : ""} on{" "}
            {new Date(result.completedAt).toLocaleDateString("en-US")}
          </Text>
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{result.score}</Text>
            <Text style={styles.scoreLabel}>Readiness Score</Text>
            <Text style={styles.body}>{result.readinessLabel}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.sectionLabel}>Overall Readiness Analysis</Text>
            <Text style={styles.body}>{result.summary.summary}</Text>
            <Text style={[styles.body, { marginTop: 8 }]}>{result.summary.overview}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Key Recommended Actions</Text>
          <View style={styles.actionGrid}>
            {result.summary.recommendations.map((recommendation) => (
              <View key={recommendation} style={styles.actionItem}>
                <Text style={styles.body}>{recommendation}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Domain Breakdown</Text>
          <Text style={styles.sectionTitle}>Findings and Recommended Actions</Text>
          {result.summary.domainBreakdowns.map((domain) => (
            <View key={domain.category} style={styles.domainCard} wrap={false}>
              <View style={styles.domainHeader}>
                <Text style={styles.domainTitle}>{domain.category}</Text>
                <Text style={styles.domainScore}>{domain.score}/100</Text>
              </View>
              <Text style={styles.sectionLabel}>Analysis</Text>
              <Text style={styles.body}>{domain.finding}</Text>
              <Text style={[styles.sectionLabel, { marginTop: 10 }]}>Recommended Actions</Text>
              {domain.recommendations.map((recommendation) => (
                <View key={recommendation} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{recommendation}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Prioritized Roadmap</Text>
          {result.summary.roadmap.map((item) => (
            <View key={`${item.priority}-${item.focus}`} style={styles.domainCard} wrap={false}>
              <Text style={styles.domainTitle}>
                {item.priority}: {item.focus}
              </Text>
              {item.actions.map((action) => (
                <View key={action} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{action}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          How results are determined: This preliminary assessment is based on the maturity options selected,
          any rationale provided, the target score for each question, and the criticality weighting assigned
          to each control area. The output is intended to guide discovery and prioritization, not to serve as
          a formal audit, certification, or compliance determination.
        </Text>
      </Page>
    </Document>
  );
}

function isWebReadableStream(value: unknown): value is ReadableStream<Uint8Array> {
  return typeof value === "object" && value !== null && "getReader" in value;
}

function isNodeReadableStream(value: unknown): value is NodeJS.ReadableStream {
  return typeof value === "object" && value !== null && "on" in value;
}

async function webStreamToBuffer(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    if (value) {
      chunks.push(value);
    }
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}

async function nodeStreamToBuffer(stream: NodeJS.ReadableStream) {
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    stream.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export async function renderAssessmentPdf(result: AssessmentResultPayload) {
  const pdfInstance = pdf(<AssessmentReportDocument result={result} />);
  const pdfOutput: unknown = await pdfInstance.toBuffer();

  if (Buffer.isBuffer(pdfOutput)) {
    return pdfOutput;
  }

  if (pdfOutput instanceof Uint8Array) {
    return Buffer.from(pdfOutput);
  }

  if (isWebReadableStream(pdfOutput)) {
    return webStreamToBuffer(pdfOutput);
  }

  if (isNodeReadableStream(pdfOutput)) {
    return nodeStreamToBuffer(pdfOutput);
  }

  throw new Error("Unable to render assessment PDF.");
}
