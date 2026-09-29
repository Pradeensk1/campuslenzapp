import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, query, action = 'chat', targetRole } = body;

    if (!profile) {
      return NextResponse.json({
        success: false,
        message: 'Profile information from the database is required.'
      }, { status: 400 });
    }

    const {
      fullName = 'Student',
      collegeName = 'Campus Lenz Institute',
      department = 'Engineering & Technology',
      course = 'B.Tech',
      graduationBatch = '2026',
      skills = [],
      headline = '',
      bio = '',
      studentRollNo = ''
    } = profile;

    const normalizedSkills: string[] = Array.isArray(skills) ? skills : [];
    const skillsListStr = normalizedSkills.length > 0 ? normalizedSkills.join(', ') : 'General Problem Solving & Academics';

    // 1. Action: Generate Tailored Resume Bullets
    if (action === 'resume_bullets') {
      const bullets = [
        `Spearheaded technical architecture using ${normalizedSkills.slice(0, 3).join(', ') || 'modern software patterns'}, boosting system reliability and response latency by 35% in campus projects.`,
        `Synthesized real-time project solutions within ${department} at ${collegeName}, translating complex academic theory into scalable, production-grade applications.`,
        `Collaborated with peers to engineer cross-functional tools leveraging ${normalizedSkills[0] || 'core engineering principles'}, maintaining rigorous version control and 98% test coverage.`
      ];
      return NextResponse.json({
        success: true,
        action: 'resume_bullets',
        bullets,
        meta: { skillsCount: normalizedSkills.length, collegeName, department }
      });
    }

    // 2. Action: Mock Technical Interview Simulation Question
    if (action === 'interview_question') {
      const primarySkill = normalizedSkills[0] || 'System Architecture';
      const question = {
        title: `Technical Screening Question for ${primarySkill}`,
        scenario: `As a candidate from ${department} (${collegeName}) graduating in ${graduationBatch}:`,
        question: `Explain how you would design and deploy an end-to-end service demonstrating ${primarySkill}. How would you manage data persistence, prevent bottleneck latency under high concurrent student traffic, and ensure graceful failover?`,
        evaluationCriteria: [
          `Clear architectural diagram or step-by-step data flow`,
          `Practical application of ${primarySkill} best practices`,
          `Handling edge cases (scalability, race conditions, memory optimization)`
        ],
        sampleAnswerHint: `Focus on modular decomposition, caching frequently accessed items, and writing clean asynchronous handlers.`
      };
      return NextResponse.json({
        success: true,
        action: 'interview_question',
        question
      });
    }

    // 3. Action: Placement Readiness Analysis
    if (action === 'match') {
      const roleTracks = [
        {
          role: 'Fullstack Software Engineer',
          targetSkills: ['Fullstack Developer', 'React', 'Node.js', 'TypeScript', 'Next.js', 'SQL', 'PostgreSQL', 'Git'],
          avgSalaryTier: '8 - 24 LPA',
          topRecruiters: ['Zoho', 'Amazon', 'Freshworks', 'Thoughtworks']
        },
        {
          role: 'Data Analyst & BI Specialist',
          targetSkills: ['Data Analyst', 'Python', 'SQL', 'Tableau', 'Power BI', 'Excel', 'Pandas'],
          avgSalaryTier: '7 - 18 LPA',
          topRecruiters: ['Mu Sigma', 'Tiger Analytics', 'Fractal', 'Accenture AI']
        },
        {
          role: 'UI/UX & Product Designer',
          targetSkills: ['UI/UX Designer', 'Figma', 'Wireframing', 'User Research', 'Design Systems', 'Prototyping'],
          avgSalaryTier: '6 - 16 LPA',
          topRecruiters: ['CRED', 'Swiggy', 'Razorpay', 'Zoho Design']
        },
        {
          role: 'Cloud & DevOps Engineer',
          targetSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform', 'DevOps'],
          avgSalaryTier: '8 - 22 LPA',
          topRecruiters: ['Amazon Web Services', 'Infosys Cloud', 'Wipro Digital', 'Cognizant']
        },
        {
          role: 'Core Engineering Specialist',
          targetSkills: ['AutoCAD', 'MATLAB', 'Embedded Systems', 'IoT', 'SolidWorks', 'PLC'],
          avgSalaryTier: '5 - 12 LPA',
          topRecruiters: ['L&T', 'Bosch', 'Tata Motors', 'TVS Motors']
        }
      ];

      const scoredTracks = roleTracks.map(track => {
        const matching = normalizedSkills.filter(s =>
          track.targetSkills.some(ts => ts.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(ts.toLowerCase()))
        );
        const missing = track.targetSkills.filter(ts =>
          !normalizedSkills.some(s => s.toLowerCase() === ts.toLowerCase() || s.toLowerCase().includes(ts.toLowerCase()))
        );
        const matchPercent = Math.min(100, Math.max(30, Math.round((matching.length / (track.targetSkills.length * 0.6)) * 100)));

        return {
          role: track.role,
          matchPercent,
          matchingSkills: matching,
          missingSkills: missing.slice(0, 3),
          avgSalaryTier: track.avgSalaryTier,
          topRecruiters: track.topRecruiters
        };
      }).sort((a, b) => b.matchPercent - a.matchPercent);

      return NextResponse.json({
        success: true,
        action: 'match',
        scoredTracks,
        profileSummary: {
          fullName,
          department,
          graduationBatch,
          collegeName,
          skillsCount: normalizedSkills.length
        }
      });
    }

    // 4. Default Action: Context-Aware Interactive Chat
    let reply = '';
    const cleanQ = (query || '').toLowerCase();

    if (cleanQ.includes('zoho') || cleanQ.includes('amazon') || cleanQ.includes('placement') || cleanQ.includes('interview')) {
      reply = `Hello ${fullName}! Based on your profile in ${department} at ${collegeName} (Class of ${graduationBatch}) and your active skill set (${skillsListStr}):

1. **Campus Placement Assessment**:
   Companies like Zoho and Amazon visiting ${collegeName} look specifically for candidates with strong foundational problem solving combined with your skills in ${normalizedSkills.slice(0, 2).join(' and ') || 'software engineering'}.

2. **Immediate Focus Areas for Batch of ${graduationBatch}**:
   - Master Data Structures (Array recursion, Matrix manipulation, Graph traversal).
   - Build 2 high-impact capstone projects demonstrating clean OOP and database schema design.
   - Request mock interviews from verified alumni mentors in the CampusLenz Alumni Network.

3. **Recommended Next Step**:
   Add 2 more technical skills or portfolio links to your student profile so hiring alumni can discover you directly!`;
    } else if (cleanQ.includes('resume') || cleanQ.includes('cv') || cleanQ.includes('bullet')) {
      reply = `Here is a personalized resume review tailored to your profile (${course} ${department}, ${collegeName}):

- **Headline Recommendation**: "${normalizedSkills[0] || 'Aspiring Software Engineer'} | ${department} @ ${collegeName} '26"
- **Top Project Recommendation**: Build an end-to-end fullstack platform that utilizes your verified skills in ${skillsListStr}. Ensure you include quantifiable metrics (e.g. "Reduced query latency by 40%").
- **Tip**: Align your profile projects with the placement recruiters visiting ${collegeName}.`;
    } else if (cleanQ.includes('skill') || cleanQ.includes('learn') || cleanQ.includes('roadmap')) {
      reply = `Analyzing your current profile database skills (${skillsListStr}):

You have a solid foundation! To elevate your placement readiness for the ${graduationBatch} drive:
- **Priority 1**: Deepen your mastery of system design and cloud deployments (AWS/Docker).
- **Priority 2**: Build production-grade APIs with rigorous test automation.
- **Priority 3**: Participate in college hackathons and showcase your live deployments in the Campus Feed!`;
    } else {
      reply = `Hello ${fullName}! I am your Campus Lenz Career Copilot, directly connected to your student profile from the database:
- 🏛️ **Institute**: ${collegeName}
- 📚 **Department**: ${department} (${course})
- 🎓 **Graduation Batch**: ${graduationBatch}
- 🛠️ **Current Skills**: ${skillsListStr}
${studentRollNo ? `- 🆔 **Roll No**: ${studentRollNo}\n` : ''}
How can I assist your career progression today? You can ask me to simulate technical interviews, optimize your resume for campus drives, analyze high-paying tech tracks, or connect with alumni mentors!`;
    }

    return NextResponse.json({
      success: true,
      action: 'chat',
      reply,
      studentContext: {
        fullName,
        collegeName,
        department,
        graduationBatch,
        skillsCount: normalizedSkills.length,
        skills: normalizedSkills
      }
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message || 'Career Copilot processing error'
    }, { status: 500 });
  }
}
