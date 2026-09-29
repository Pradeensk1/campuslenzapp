import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { StudentCareerProfile } from '@/types';

interface StudentContextInput {
  fullName: string;
  collegeName?: string;
  collegeId?: string;
  department?: string;
  course?: string;
  graduationBatch?: string;
  careerProfile?: StudentCareerProfile;
}

interface CollegeContextInput {
  name?: string;
  placementStats?: {
    highestPackage?: string;
    averagePackage?: string;
    placementRate?: string;
    topRecruiters?: string[];
  };
  placementDetails?: {
    highestPackage?: string;
    averagePackage?: string;
    medianPackage?: string;
    placementRate?: string;
    topRecruiters?: string[];
    internshipOffers?: string;
    placementTraining?: string;
    tier1HiresCount?: number;
  };
}

interface AcademicContextInput {
  enrolledCourses?: string[];
  tasks?: Array<{
    title: string;
    courseCode: string;
    isCompleted: boolean;
    urgency?: string;
  }>;
  milestones?: Array<{
    examName: string;
    courseCode: string;
    remainingDays: number;
  }>;
}

interface HistoryItem {
  role: 'user' | 'model';
  text: string;
}

interface CopilotRequestBody {
  message: string;
  history?: HistoryItem[];
  studentContext: StudentContextInput;
  collegeContext?: CollegeContextInput;
  academicContext?: AcademicContextInput;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    try {
      const body: CopilotRequestBody = await request.json();
      const { message, studentContext } = body;
      const targetRole = studentContext?.careerProfile?.targetRole || 'Software Engineer';
      const skills = (studentContext?.careerProfile?.skills || []).join(', ') || 'Core Computer Science & Systems';
      const college = studentContext?.collegeName || 'Campus Lenz College';

      return NextResponse.json({
        success: true,
        reply: `### 🎯 Career Copilot Placement Strategy (Campus Offline Mode)

Hello **${studentContext?.fullName || 'Student'}**! Here is your customized preparation roadmap for **${targetRole}**:

#### 1. Skill Profile & Gap Analysis
- **Your Verified Skills**: ${skills}
- **Target Role**: ${targetRole}
- **Institutional Context**: ${college} (${studentContext?.department || 'Engineering'}, Batch ${studentContext?.graduationBatch || '2026'})

#### 2. Strategic 4-Week Placement Blueprint
1. **Week 1 (Foundations & DSA)**: Master top 50 LeetCode patterns (Sliding Window, Two Pointers, Graph BFS/DFS) and review data structures.
2. **Week 2 (Core Projects)**: Build a production-grade full-stack project demonstrating database migrations, API design, and automated testing.
3. **Week 3 (Campus Placement Alignment)**: Review previous placement test patterns for top recruiters visiting ${college}.
4. **Week 4 (Mock Interviews & Peer Review)**: Connect with alumni mentors in the **Connect Hub** and schedule peer mock rounds in **Study Rooms**.

*Tip: To enable live multimodal Gemini streaming insights, add \`GEMINI_API_KEY\` to your Vercel project environment settings.*`,
        modelUsed: 'campus-lenz-heuristic-fallback'
      });
    } catch {
      return NextResponse.json({
        success: true,
        reply: "Career Copilot is ready. Please configure your Target Role and Skills in your student profile to generate personalized placement insights.",
        modelUsed: 'campus-lenz-heuristic-fallback'
      });
    }
  }

  try {
    const body: CopilotRequestBody = await request.json();
    const { message, history = [], studentContext, collegeContext, academicContext } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message cannot be empty.' },
        { status: 400 }
      );
    }

    // Build grounded prompt context
    const career = studentContext.careerProfile;
    const targetRole = career?.targetRole?.trim() || null;
    const skills = Array.isArray(career?.skills) && career.skills.length > 0 ? career.skills : [];
    const currentLearning = Array.isArray(career?.currentLearning) && career.currentLearning.length > 0 ? career.currentLearning : [];
    const completedLearning = Array.isArray(career?.completedLearning) && career.completedLearning.length > 0 ? career.completedLearning : [];

    const collegePlacementInfo = collegeContext?.placementDetails || collegeContext?.placementStats || null;
    const topRecruiters = collegePlacementInfo?.topRecruiters || [];

    const taskSummary = (academicContext?.tasks || [])
      .map(t => `- [${t.isCompleted ? 'Completed' : 'In Progress'}] ${t.title} (${t.courseCode})`)
      .slice(0, 6)
      .join('\n');

    const systemInstruction = `
You are Career Copilot, an AI career mentor and placement strategist built into the Campus Lenz collegiate ecosystem.

Your mission is to provide personalized, rigorous, practical career mentorship and placement preparation roadmaps for university students.

=== GROUNDED STUDENT CONTEXT ===
- Name: ${studentContext.fullName || 'Student'}
- College: ${studentContext.collegeName || 'Not specified'}
- Department: ${studentContext.department || 'Not specified'}
- Degree Program / Course: ${studentContext.course || 'Not specified'}
- Graduation Batch: ${studentContext.graduationBatch || 'Not specified'}

=== CAREER PROFILE & SKILLS ===
- Target Career / Role: ${targetRole || 'NOT SET YET'}
- Current Skills: ${skills.length > 0 ? skills.join(', ') : 'NONE SPECIFIED YET'}
- Currently Learning: ${currentLearning.length > 0 ? currentLearning.join(', ') : 'NONE SPECIFIED YET'}
- Completed Learning / Milestones: ${completedLearning.length > 0 ? completedLearning.join(', ') : 'NONE SPECIFIED YET'}

=== CAMPUS PLACEMENT CONTEXT (${studentContext.collegeName || 'College'}) ===
- Average Package: ${collegePlacementInfo?.averagePackage || 'Standard tier campus baseline'}
- Highest Package: ${collegePlacementInfo?.highestPackage || 'Tier-1 tech opportunities'}
- Top Recruiters: ${topRecruiters.length > 0 ? topRecruiters.join(', ') : 'Major campus technology recruiters'}
- Placement Training: ${collegeContext?.placementDetails?.placementTraining || 'Structured departmental placement training'}
- Tier-1 Hires: ${collegeContext?.placementDetails?.tier1HiresCount ? `${collegeContext.placementDetails.tier1HiresCount} hires` : 'Active campus hiring drives'}

=== ACADEMIC COURSEWORK & TASKS ===
${taskSummary || 'No active academic tasks recorded.'}

=== STRICT OPERATING GUIDELINES ===
1. Use ONLY the supplied Campus Lenz context above. Do not invent or assume student skills, certifications, GPAs, or projects that are not provided.
2. If the student has not yet set a Target Role, Skills, or Learning Topics, CLEARLY identify what is missing and encourage them to configure it in their Career Profile.
3. Tailor all advice specifically to their graduation batch timeline (e.g. if graduating soon, focus on interview rounds, LeetCode patterns, and resume audits; if earlier batch, focus on core computer science foundations and end-to-end projects).
4. Conduct objective Skill Gap Analysis between their current skills and the industry expectations for their target role.
5. Provide actionable, phased roadmaps with concrete milestones (e.g. Week 1-2, Week 3-4, or Month 1, Month 2).
6. NEVER guarantee jobs, job offers, specific salaries, or guaranteed placement results. Use probabilistic, realistic, and coaching-oriented phrasing.
7. Recommend relevant Campus Lenz ecosystem features where appropriate:
   - "Alumni Mentorship": Suggest booking a 1:1 resume review or mock interview with alumni on Campus Lenz.
   - "Alumni Job Referrals": Suggest exploring referrals posted by verified alumni in the community.
   - "Study Rooms": Suggest joining peer focus rooms for LeetCode or core subjects.
   - "Course Q&A": Suggest asking questions to faculty or seniors on course concepts.
8. Format responses using clean GitHub-style Markdown with bold headings, bullet points, and concise tables where helpful.
`;

    // Initialize Google GenAI client
    const ai = new GoogleGenAI({ apiKey });

    // Format chat history
    const contents: any[] = [];
    for (const h of history) {
      contents.push({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }]
      });
    }
    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Try primary model (gemini-3.8-flash), fallback to gemini-3.5-flash-lite if temporary 503/high-demand
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
    let lastError: any = null;
    let replyText = '';
    let chosenModel = '';

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction
          }
        });
        replyText = response.text || '';
        chosenModel = model;
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} unavailable, trying fallback:`, err.message);
      }
    }

    if (!replyText) {
      throw lastError || new Error('Failed to generate response from Gemini API.');
    }

    return NextResponse.json({
      success: true,
      reply: replyText,
      modelUsed: chosenModel
    });
  } catch (err: any) {
    console.error('Career Copilot API error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'An error occurred while communicating with Career Copilot.'
      },
      { status: 500 }
    );
  }
}
