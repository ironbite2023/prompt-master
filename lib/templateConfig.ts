import { 
  PromptTemplate, 
  PromptCategory, 
  TemplateDifficulty 
} from './types';

/**
 * Curated collection of professional prompt templates
 * Organized by category with 1-3 templates per category
 */
export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // SOFTWARE DEVELOPMENT (3 templates)
  {
    id: 'prd-generator',
    title: 'Product Requirements Document (PRD)',
    description: 'Generate comprehensive PRDs for software products with all essential sections.',
    category: PromptCategory.SOFTWARE_DEV,
    prompt: `Create a detailed Product Requirements Document (PRD) for [Product Name - describe briefly].

**Structure Required:**

1. **Executive Summary**
   - Product vision and primary goals
   - Target launch timeline
   - Key stakeholders and decision makers

2. **Problem Statement & Market Analysis**
   - User pain points we're solving
   - Market opportunity size
   - Competitive landscape overview

3. **Target Users & Personas**
   - Primary user persona (demographics, goals, frustrations)
   - Secondary user persona
   - User journey mapping

4. **Core Features & Functionality**
   - Must-have features (P0) with detailed descriptions
   - Should-have features (P1)
   - Nice-to-have features (P2)
   - Feature prioritization rationale

5. **Technical Requirements**
   - Technology stack recommendations
   - Performance benchmarks (load time, capacity)
   - Security & compliance requirements
   - Third-party integrations needed

6. **Success Metrics & KPIs**
   - User engagement metrics
   - Business success metrics
   - Technical performance metrics

7. **Timeline & Milestones**
   - Development phases with dates
   - Key deliverable milestones
   - Go-to-market timeline

8. **Risks & Mitigation Strategies**
   - Technical risks and solutions
   - Market risks and contingencies

Make it professional, stakeholder-ready, and actionable for engineering teams.`,
    icon: 'FileText',
    tags: ['prd', 'requirements', 'software', 'product', 'planning', 'documentation'],
    difficulty: TemplateDifficulty.INTERMEDIATE,
    estimatedTime: '4-6 minutes',
    useCases: [
      'New product launches',
      'Feature specifications',
      'Stakeholder presentations',
      'Engineering handoffs'
    ],
    expectedOutput: 'Comprehensive 8-section PRD with user stories, technical specs, and success metrics',
    popularity: 10
  },

  {
    id: 'api-documentation',
    title: 'API Documentation Generator',
    description: 'Create comprehensive API documentation with examples and best practices.',
    category: PromptCategory.SOFTWARE_DEV,
    prompt: `Generate comprehensive API documentation for [API Name - brief description].

**Documentation Structure:**

1. **Overview & Authentication**
   - API purpose and key capabilities
   - Authentication methods (API key, OAuth, JWT)
   - Base URLs and versioning strategy

2. **Getting Started**
   - Quick start guide with example request
   - SDK/library recommendations
   - Rate limiting and usage guidelines

3. **Endpoint Documentation** (For each endpoint):
   - HTTP method and full URL
   - Required and optional parameters
   - Request body schema with data types
   - Response schema with examples
   - Possible error codes and meanings
   - Code examples in cURL, JavaScript, and Python

4. **Data Models**
   - All object schemas used in requests/responses
   - Field descriptions with validation rules
   - Example JSON objects

5. **Error Handling**
   - Standard error response format
   - Complete list of error codes
   - Troubleshooting common issues

6. **Changelog & Versioning**
   - Recent updates and breaking changes
   - Deprecation timeline for old features

Make it developer-friendly with clear examples and comprehensive reference material.`,
    icon: 'Code2',
    tags: ['api', 'documentation', 'endpoints', 'development', 'technical'],
    difficulty: TemplateDifficulty.INTERMEDIATE,
    estimatedTime: '3-5 minutes',
    useCases: [
      'REST API documentation',
      'GraphQL API guides',
      'SDK documentation',
      'Developer onboarding'
    ],
    expectedOutput: 'Complete API reference with examples, schemas, and developer guides',
    popularity: 8
  },

  {
    id: 'code-review-analyzer',
    title: 'Code Review & Analysis',
    description: 'Perform thorough code reviews with security, performance, and best practice analysis.',
    category: PromptCategory.SOFTWARE_DEV,
    prompt: `Perform a comprehensive code review and analysis of the following code:

[PASTE YOUR CODE HERE]

**Review Areas:**

1. **Code Quality Assessment**
   - Readability and maintainability
   - Adherence to coding standards and conventions
   - DRY principle and code reusability
   - Proper naming conventions

2. **Security Analysis**
   - Potential security vulnerabilities
   - Input validation and sanitization
   - Authentication and authorization issues
   - Data exposure risks

3. **Performance Evaluation**
   - Algorithm efficiency (Big O notation)
   - Memory usage optimization
   - Database query optimization
   - Potential bottlenecks

4. **Best Practices Check**
   - Error handling and logging
   - Testing coverage gaps
   - Documentation completeness
   - Architecture pattern adherence

5. **Improvement Recommendations**
   - Specific refactoring suggestions with code examples
   - Performance optimization opportunities
   - Security hardening steps
   - Maintainability improvements

Provide actionable feedback with priority levels (High/Medium/Low) and code examples where applicable.`,
    icon: 'Search',
    tags: ['code review', 'analysis', 'security', 'performance', 'best practices'],
    difficulty: TemplateDifficulty.ADVANCED,
    estimatedTime: '2-4 minutes',
    useCases: [
      'Pull request reviews',
      'Legacy code assessment',
      'Security audits',
      'Performance optimization'
    ],
    expectedOutput: 'Detailed code analysis with specific improvements and security recommendations',
    popularity: 7
  },

  // CONTENT WRITING (2 templates)
  {
    id: 'seo-blog-post',
    title: 'SEO-Optimized Blog Post',
    description: 'Create engaging, search-engine-optimized blog content that ranks and converts.',
    category: PromptCategory.CONTENT_WRITING,
    prompt: `Write a comprehensive, SEO-optimized blog post about [Your Topic].

**Content Specifications:**

**SEO Requirements:**
- Primary keyword: [Your Main Keyword]
- Secondary keywords: [List 3-4 related terms]
- Target word count: 1,500-2,000 words
- Meta title (60 characters max, include primary keyword)
- Meta description (155 characters, compelling with CTA)

**Content Structure:**
1. **Compelling Headline** (include primary keyword + power word)
2. **Introduction** (150-200 words)
   - Hook with surprising statistic or question
   - Clearly state the problem
   - Preview the solution/value

3. **Main Body** (5-7 H2 sections, each 200-300 words)
   - Use secondary keywords in subheadings
   - Include bullet points and numbered lists
   - Add relevant examples and case studies
   - Incorporate data and statistics

4. **Conclusion** (100-150 words)
   - Summarize key takeaways
   - Strong call-to-action
   - Encourage engagement (comments, shares)

**Optimization Elements:**
- Natural keyword density (1-2%)
- Internal linking opportunities (suggest 3-4)
- External links to authoritative sources
- Image suggestions with SEO-friendly alt text
- Table of contents for long-form content
- Featured snippet optimization (answer common questions)

**Tone & Style:**
- Conversational yet professional
- Short paragraphs (2-3 sentences)
- Active voice
- Include rhetorical questions
- Use transition words for flow

Make it valuable, engaging, and optimized for both search engines and human readers.`,
    icon: 'PenTool',
    tags: ['blog', 'seo', 'content marketing', 'writing', 'organic traffic'],
    difficulty: TemplateDifficulty.BEGINNER,
    estimatedTime: '3-4 minutes',
    useCases: [
      'Content marketing campaigns',
      'Organic traffic generation',
      'Thought leadership',
      'Educational content'
    ],
    expectedOutput: '1,500+ word SEO-optimized blog post with proper structure and keyword integration',
    popularity: 9
  },

  {
    id: 'newsletter-writer',
    title: 'Engaging Newsletter Content',
    description: 'Create compelling newsletter content that drives engagement and action.',
    category: PromptCategory.CONTENT_WRITING,
    prompt: `Create an engaging newsletter edition about [Your Topic/Industry Update].

**Newsletter Structure:**

**Header Section:**
- Compelling subject line (45-50 characters, create urgency/curiosity)
- Preview text that complements subject line
- Personal greeting with subscriber's benefit

**Opening Hook:**
- Start with intriguing question, statistic, or trend
- Connect to subscriber's interests/pain points
- Set expectation for value in this edition

**Main Content Blocks (3-4 sections):**

1. **Primary Story/Update**
   - Most important news or insight
   - Why it matters to your audience
   - Actionable implications

2. **Quick Hits/Industry Roundup**
   - 3-4 brief but valuable updates
   - Bullet point format for scannability
   - Include relevant links

3. **Educational/How-To Section**
   - Practical tip or mini-tutorial
   - Step-by-step guidance
   - Immediate applicability

4. **Community/Personal Touch**
   - Behind-the-scenes insight
   - Reader spotlight or success story
   - Question to encourage replies

**Call-to-Action Sections:**
- Primary CTA (main goal for this newsletter)
- Secondary CTA (engagement or social sharing)
- Feedback request or question

**Footer Elements:**
- Social media links
- Unsubscribe option
- Contact information

**Style Guidelines:**
- Conversational, personal tone
- Short paragraphs and sentences
- Use "you" and "your" frequently
- Include emojis sparingly but effectively
- Mobile-friendly formatting

Make it feel like a valuable update from a knowledgeable friend, not a sales pitch.`,
    icon: 'Mail',
    tags: ['newsletter', 'email marketing', 'engagement', 'content', 'communication'],
    difficulty: TemplateDifficulty.BEGINNER,
    estimatedTime: '3-4 minutes',
    useCases: [
      'Weekly industry updates',
      'Company newsletters',
      'Educational content series',
      'Community building'
    ],
    expectedOutput: 'Complete newsletter with engaging subject line, structured content, and clear CTAs',
    popularity: 8
  },

  // MARKETING & ADVERTISING (2 templates)  
  {
    id: 'social-media-campaign',
    title: 'Social Media Campaign Planner',
    description: 'Plan comprehensive social media campaigns with content calendar and engagement strategy.',
    category: PromptCategory.MARKETING,
    prompt: `Create a comprehensive social media campaign plan for [Your Product/Service/Event].

**Campaign Overview:**
- Campaign objective: [Awareness/Engagement/Conversion/Traffic]
- Target audience: [Demographics, interests, pain points]
- Campaign duration: [Start date to end date]
- Budget allocation: [Per platform breakdown]
- Key performance metrics: [Reach, engagement, conversions, etc.]

**Platform Strategy:**

**Facebook/Instagram:**
- Content mix (60% educational, 30% promotional, 10% behind-scenes)
- Post frequency and optimal timing
- Visual style and brand consistency
- Hashtag strategy (trending + branded + niche)
- Story content ideas
- Reel/Video content concepts

**LinkedIn** (if B2B):
- Thought leadership content themes
- Industry insight sharing strategy
- Employee advocacy approach
- LinkedIn article topics

**Twitter/X:**
- Real-time engagement strategy
- Thread content ideas
- Community interaction approach
- Trending topic opportunities

**Content Calendar (Week by Week):**
- Week 1: [Content themes and key posts]
- Week 2: [Content themes and key posts]
- Week 3: [Content themes and key posts]
- Week 4: [Content themes and key posts]

**Content Creation:**
- 10 specific post ideas with captions
- 5 visual content concepts
- 3 video/reel ideas
- User-generated content strategy
- Influencer collaboration opportunities

**Engagement Strategy:**
- Community management approach
- Response templates for common questions
- Cross-platform promotion tactics
- Contest/giveaway integration

**Measurement & Optimization:**
- Weekly metrics review schedule
- A/B testing opportunities
- Content performance analysis
- Campaign adjustment protocols

Include specific examples and actionable next steps for immediate implementation.`,
    icon: 'TrendingUp',
    tags: ['social media', 'campaign', 'marketing', 'content calendar', 'engagement'],
    difficulty: TemplateDifficulty.INTERMEDIATE,
    estimatedTime: '4-5 minutes',
    useCases: [
      'Product launches',
      'Brand awareness campaigns',
      'Event promotion',
      'Seasonal marketing'
    ],
    expectedOutput: 'Complete campaign plan with content calendar, platform strategies, and measurement framework',
    popularity: 9
  },

  {
    id: 'email-marketing-sequence',
    title: 'Email Marketing Sequence',
    description: 'Design automated email sequences that nurture leads and drive conversions.',
    category: PromptCategory.MARKETING,
    prompt: `Design a comprehensive email marketing sequence for [Your Product/Service].

**Sequence Overview:**
- Sequence goal: [Lead nurturing/Onboarding/Re-engagement/Sales]
- Target audience: [Demographics and behavior profile]
- Sequence length: [Number of emails over X days/weeks]
- Primary conversion goal: [Sign up/Purchase/Book call/Download]

**Email Sequence Structure:**

**Email 1: Welcome & Value Delivery** (Send immediately)
- Subject line options (3 variations)
- Warm welcome message
- Immediate value (resource/tip/exclusive content)
- Set expectations for sequence
- Strong but soft CTA

**Email 2: Problem Agitation** (Send after 2-3 days)
- Subject line that creates curiosity
- Dive deeper into pain points
- Share relatable story or case study
- Position solution subtly
- Educational CTA

**Email 3: Solution Introduction** (Send after 5-7 days)
- Benefit-focused subject line
- Present your solution clearly
- Include social proof (testimonials/reviews)
- Address common objections
- Soft pitch with value-first approach

**Email 4: Social Proof & Authority** (Send after 10-12 days)
- Credibility-focused subject line
- Customer success stories
- Industry recognition or media mentions
- Behind-the-scenes credibility building
- Case study or detailed testimonial

**Email 5: Urgency & Call-to-Action** (Send after 15-18 days)
- Urgency-creating subject line
- Limited-time offer or bonus
- Clear value proposition summary
- Strong, direct CTA
- Scarcity elements if appropriate

**Email 6: Final Value & Soft Close** (Send after 20-22 days)
- Value-focused subject line
- Additional free resource
- Summarize relationship value
- Soft invitation to continue engagement
- Multiple low-pressure CTAs

**Technical Specifications:**
- Email length: 150-300 words each
- Mobile-optimized formatting
- Clear unsubscribe option
- Personalization tokens
- A/B testing suggestions for subject lines

**Performance Tracking:**
- Open rate benchmarks by email
- Click-through rate expectations  
- Conversion tracking setup
- Segmentation opportunities
- Optimization recommendations

Provide specific copy examples and technical implementation notes.`,
    icon: 'Send',
    tags: ['email marketing', 'automation', 'lead nurturing', 'conversion', 'sequence'],
    difficulty: TemplateDifficulty.INTERMEDIATE,
    estimatedTime: '4-6 minutes',
    useCases: [
      'Lead nurturing campaigns',
      'Customer onboarding',
      'Product launches',
      'Re-engagement sequences'
    ],
    expectedOutput: '6-email automated sequence with subject lines, copy, and performance tracking setup',
    popularity: 8
  },

  // BUSINESS COMMUNICATION (2 templates)
  {
    id: 'professional-email',
    title: 'Professional Email Composer',
    description: 'Craft polished, effective business emails for any professional situation.',
    category: PromptCategory.BUSINESS_COMM,
    prompt: `Compose a professional business email for the following situation:

**Email Purpose:** [Describe the main goal - request, update, proposal, etc.]
**Recipient:** [Relationship and context - client, colleague, vendor, etc.]  
**Key Points to Address:** [List 2-4 main points that must be covered]
**Desired Outcome:** [What you want the recipient to do after reading]
**Tone:** [Professional, friendly, formal, urgent - specify preference]

**Email Structure:**

**Subject Line:**
- Create 3 subject line options
- Keep under 50 characters
- Make purpose immediately clear
- Include urgency if applicable

**Opening:**
- Appropriate greeting based on relationship
- Context setting (reference previous conversation/meeting)
- Clear statement of email purpose

**Body Paragraphs:**
- One main point per paragraph
- Use bullet points for multiple items
- Include relevant details and context
- Provide clear reasoning for requests
- Anticipate and address potential concerns

**Call to Action:**
- Specific request or next step
- Timeline if applicable
- Make response easy (suggest times, provide links)
- Offer alternative options when appropriate

**Professional Closing:**
- Appropriate sign-off based on formality level
- Contact information if needed
- Professional signature block suggestion

**Additional Elements:**
- Attachment references if applicable
- Meeting availability
- Contact alternatives
- Polite follow-up timeline

**Formatting Guidelines:**
- Short paragraphs for easy reading
- Strategic use of bold for key points
- Professional but approachable tone
- Mobile-friendly formatting
- Clear visual hierarchy

Ensure the email is concise, action-oriented, and maintains professional relationships while achieving the stated goal.`,
    icon: 'Mail',
    tags: ['email', 'business communication', 'professional', 'correspondence', 'workplace'],
    difficulty: TemplateDifficulty.BEGINNER,
    estimatedTime: '2-3 minutes',
    useCases: [
      'Client communications',
      'Project updates',
      'Meeting requests',
      'Vendor negotiations'
    ],
    expectedOutput: 'Professional email with subject lines, structured body, and clear call-to-action',
    popularity: 10
  },

  {
    id: 'executive-summary',
    title: 'Executive Summary Generator',
    description: 'Create compelling executive summaries that communicate key information to stakeholders.',
    category: PromptCategory.BUSINESS_COMM,
    prompt: `Create a comprehensive executive summary for [Your Project/Report/Proposal].

**Document Context:**
- Full document type: [Business plan, project report, research study, etc.]
- Target audience: [C-suite, investors, board members, etc.]
- Primary decision needed: [Approval, funding, direction, etc.]
- Key stakeholder concerns: [Budget, timeline, ROI, risk, etc.]

**Executive Summary Structure:**

**Opening Statement** (1-2 sentences)
- Hook that captures attention immediately
- Clear statement of opportunity or problem
- Quantify impact where possible

**Problem/Opportunity** (2-3 sentences)
- Current situation analysis
- Market gap or business need
- Cost of inaction or competitive pressure

**Proposed Solution** (3-4 sentences)
- Core recommendation or approach
- Key differentiators or advantages
- High-level implementation strategy

**Financial Impact** (2-3 sentences)
- Investment required
- Expected ROI and timeline
- Revenue projections or cost savings
- Break-even analysis

**Key Benefits** (Bullet points)
- 3-5 primary advantages
- Quantified outcomes where possible
- Strategic alignment with company goals

**Implementation Overview** (2-3 sentences)
- Major milestones and timeline
- Resource requirements
- Critical success factors

**Risk Assessment** (1-2 sentences)
- Primary risks and mitigation strategies
- Contingency planning approach

**Call to Action** (1-2 sentences)
- Specific decision or approval sought
- Next steps and timeline
- Contact for questions or discussion

**Formatting Requirements:**
- Maximum 1-2 pages
- Use bullet points for key information
- Include relevant charts/graphs references
- Professional, confident tone
- Action-oriented language
- Data-driven statements

**Writing Style:**
- Lead with conclusions, then support with data
- Use active voice
- Avoid technical jargon
- Focus on business impact
- Create urgency appropriately

Ensure the summary stands alone and provides enough information for decision-making without requiring the full document.`,
    icon: 'FileText',
    tags: ['executive summary', 'business communication', 'leadership', 'reports', 'decision making'],
    difficulty: TemplateDifficulty.INTERMEDIATE,
    estimatedTime: '3-4 minutes',
    useCases: [
      'Business proposals',
      'Project reports',
      'Investment pitches',
      'Strategic plans'
    ],
    expectedOutput: 'Concise 1-2 page executive summary with financial impact and clear recommendations',
    popularity: 7
  },

  // DATA & ANALYTICS (1 template)
  {
    id: 'data-analysis-report',
    title: 'Data Analysis Report',
    description: 'Generate comprehensive data analysis reports with insights and recommendations.',
    category: PromptCategory.DATA_ANALYTICS,
    prompt: `Create a comprehensive data analysis report for [Your Dataset/Business Question].

**Analysis Context:**
- Business question: [What specific question are we trying to answer?]
- Dataset description: [Source, size, time period, key variables]
- Stakeholder audience: [Who will use these insights?]
- Decision impact: [How will results influence business decisions?]

**Report Structure:**

**Executive Summary** (1 paragraph)
- Key findings in 3-4 bullet points
- Primary recommendation
- Business impact quantification

**Methodology** (1-2 paragraphs)
- Data sources and collection methods
- Analysis techniques used
- Sample size and time period
- Limitations and assumptions

**Key Findings** (3-5 main insights)
For each finding:
- Clear statement of the insight
- Supporting statistics and percentages
- Visual representation suggestion (chart type)
- Statistical significance if applicable
- Business context and implications

**Detailed Analysis:**

1. **Trend Analysis**
   - Historical patterns and changes over time
   - Seasonal variations or cyclical patterns
   - Growth rates and trajectory projections

2. **Segment Analysis**
   - Performance by customer/product/region segments
   - Comparative analysis between segments
   - Opportunities in underperforming areas

3. **Correlation Analysis**
   - Key relationships between variables
   - Cause and effect implications
   - Predictive insights

4. **Benchmarking** (if applicable)
   - Industry comparison
   - Historical performance comparison
   - Competitive analysis

**Actionable Recommendations:**
- 3-5 specific, implementable actions
- Priority ranking (High/Medium/Low)
- Resource requirements for each
- Expected outcomes and success metrics
- Implementation timeline

**Risk Assessment:**
- Confidence level in findings
- Data quality considerations
- External factors that could impact results
- Recommended monitoring metrics

**Next Steps:**
- Additional analysis needed
- Data collection improvements
- Follow-up timeline
- Success measurement plan

**Technical Appendix:**
- Detailed methodology notes
- Statistical tests performed
- Data quality assessment
- Glossary of technical terms

**Visualization Recommendations:**
- Suggest 5-7 specific charts/graphs
- Dashboard elements for ongoing monitoring
- Key metrics to track regularly

Make the report actionable, data-driven, and accessible to non-technical stakeholders while maintaining analytical rigor.`,
    icon: 'BarChart3',
    tags: ['data analysis', 'reporting', 'insights', 'analytics', 'business intelligence'],
    difficulty: TemplateDifficulty.ADVANCED,
    estimatedTime: '4-5 minutes',
    useCases: [
      'Business performance analysis',
      'Market research reports',
      'Customer behavior analysis',
      'Operations optimization'
    ],
    expectedOutput: 'Comprehensive analysis report with findings, visualizations, and actionable recommendations',
    popularity: 6
  },

  // EDUCATION & LEARNING (1 template)
  {
    id: 'interactive-tutorial',
    title: 'Interactive Tutorial Creator',
    description: 'Design engaging, step-by-step tutorials that effectively teach complex topics.',
    category: PromptCategory.EDUCATION,
    prompt: `Create an interactive, comprehensive tutorial for [Your Topic/Skill].

**Tutorial Context:**
- Learning objective: [What should learners accomplish?]
- Target audience: [Skill level, background, goals]
- Time commitment: [Expected completion time]
- Prerequisites: [Required knowledge or tools]
- Learning format: [Text, video, hands-on, mixed]

**Tutorial Structure:**

**Introduction & Setup** (10% of content)
- Hook that shows the value/outcome
- Clear learning objectives (3-5 specific goals)
- Required tools, software, or materials
- Time expectations and difficulty level
- Success criteria definition

**Foundation Knowledge** (20% of content)
- Essential concepts and terminology
- Background context and "why this matters"
- Common misconceptions to address
- Visual aids or diagrams needed

**Step-by-Step Instructions** (60% of content)
Break into 5-7 main sections, each containing:

**Section [X]: [Skill/Concept Name]**
- Learning goal for this section
- Step-by-step instructions (numbered list)
- Code examples, screenshots, or demonstrations
- Common mistakes and troubleshooting
- Practice exercise or checkpoint
- "You should now be able to..." statement

**Hands-On Practice** (10% of content)
- 3-5 practice exercises progressing in difficulty
- Real-world scenarios to apply learning
- Self-assessment questions
- Solution explanations
- Extension challenges for advanced learners

**Advanced Applications & Next Steps**
- How to expand on basic knowledge
- Advanced techniques or variations
- Integration with other tools/skills
- Common use cases in professional settings
- Recommended further learning resources

**Interactive Elements:**
- Checkboxes for completed steps
- "Try it yourself" sections
- Quiz questions with explanations
- Troubleshooting FAQ
- Progress indicators

**Learning Aids:**
- Visual diagrams or flowcharts
- Code snippets with syntax highlighting
- Before/after examples
- Cheat sheets or quick reference guides
- Glossary of terms

**Assessment & Reinforcement:**
- Knowledge check questions throughout
- Final project or capstone exercise
- Self-evaluation rubric
- Peer review guidelines (if applicable)
- Certificate of completion criteria

**Teaching Techniques:**
- Use analogies and real-world examples
- Scaffold complexity (simple to complex)
- Multiple learning modalities (visual, hands-on, reading)
- Frequent feedback and validation
- Error-based learning opportunities

**Accessibility & Inclusion:**
- Multiple explanation methods for different learning styles
- Inclusive examples and scenarios
- Clear, jargon-free language with definitions
- Alternative formats for different abilities

Make the tutorial engaging, practical, and immediately applicable to real-world situations.`,
    icon: 'GraduationCap',
    tags: ['tutorial', 'education', 'learning', 'training', 'skill development'],
    difficulty: TemplateDifficulty.INTERMEDIATE,
    estimatedTime: '5-6 minutes',
    useCases: [
      'Employee training programs',
      'Online course content',
      'Software documentation',
      'Skill development workshops'
    ],
    expectedOutput: 'Complete interactive tutorial with exercises, assessments, and progression tracking',
    popularity: 7
  },

  // CREATIVE & DESIGN (1 template)
  {
    id: 'ui-ux-design-brief',
    title: 'UI/UX Design Brief Generator',
    description: 'Create detailed design briefs that guide successful user interface and experience projects.',
    category: PromptCategory.CREATIVE_DESIGN,
    prompt: `Generate a comprehensive UI/UX design brief for [Your Product/Feature].

**Project Overview:**
- Product/feature name: [Clear identifier]
- Project scope: [New product, redesign, feature addition]
- Timeline: [Project start and end dates]
- Budget constraints: [Development and design budget]
- Team composition: [Designers, developers, stakeholders involved]

**Business Context:**
- Company/product background
- Current business goals and challenges
- How this design project supports business objectives
- Competitive landscape and differentiation needs
- Success metrics and KPIs

**User Research & Personas:**

**Primary User Persona:**
- Demographics (age, location, tech proficiency)
- Goals and motivations
- Pain points and frustrations
- Behaviors and usage patterns
- Device preferences and context of use

**Secondary User Persona:**
- Key differences from primary persona
- Specific needs and requirements
- Usage frequency and scenarios

**User Journey Mapping:**
- Current user flow (if redesign)
- Desired future flow
- Key touchpoints and decision moments
- Emotional states throughout journey
- Opportunities for improvement

**Functional Requirements:**

**Core Features (Must-Have):**
- Feature 1: [Detailed description, user benefit, success criteria]
- Feature 2: [Detailed description, user benefit, success criteria]
- Feature 3: [Detailed description, user benefit, success criteria]

**Secondary Features (Should-Have):**
- [List with brief descriptions]

**Future Considerations (Could-Have):**
- [Features for later phases]

**Technical Constraints:**
- Platform requirements (iOS, Android, Web, Desktop)
- Browser compatibility needs
- Performance requirements (load times, responsiveness)
- Accessibility standards (WCAG 2.1 AA)
- Integration requirements with existing systems
- Technology stack limitations

**Design Requirements:**

**Visual Style Direction:**
- Brand guidelines and assets to incorporate
- Color palette preferences
- Typography requirements
- Imagery and iconography style
- Overall aesthetic goals (modern, playful, corporate, etc.)

**Interaction Design:**
- Animation and micro-interaction preferences
- Navigation patterns and information architecture
- Form design and input methods
- Feedback and error handling approaches

**Responsive Design:**
- Breakpoint requirements
- Mobile-first or desktop-first approach
- Cross-device experience considerations
- Touch vs. mouse interaction optimization

**Content Strategy:**
- Content hierarchy and prioritization
- Tone of voice and messaging guidelines
- Localization and internationalization needs
- SEO considerations (if web-based)

**Usability Requirements:**
- Task completion success rates (target %)
- Maximum task completion time
- Error rate thresholds
- User satisfaction scores (target rating)
- Accessibility compliance level

**Testing & Validation:**
- User testing methodology
- A/B testing opportunities
- Analytics tracking requirements
- Feedback collection methods
- Iteration and refinement process

**Deliverables:**
- Wireframes and user flow diagrams
- High-fidelity mockups and prototypes
- Design system and component library
- Interaction specifications and animations
- Handoff documentation for developers

**Timeline & Milestones:**
- Research and discovery phase
- Concept development and wireframing
- Visual design and prototyping
- Testing and iteration
- Final handoff and implementation support

**Success Criteria:**
- User experience metrics
- Business performance indicators
- Technical performance benchmarks
- Stakeholder satisfaction measures

Ensure the brief provides clear direction while allowing creative flexibility for innovative solutions.`,
    icon: 'Palette',
    tags: ['ui design', 'ux design', 'design brief', 'user experience', 'interface design'],
    difficulty: TemplateDifficulty.INTERMEDIATE,
    estimatedTime: '4-5 minutes',
    useCases: [
      'App design projects',
      'Website redesigns',
      'Feature development',
      'Design team briefings'
    ],
    expectedOutput: 'Comprehensive design brief with user personas, requirements, and success criteria',
    popularity: 6
  }
];

/**
 * Get top templates by popularity
 */
export const getTopTemplates = (count: number = 10): PromptTemplate[] => {
  return PROMPT_TEMPLATES
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, count);
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: PromptCategory): PromptTemplate[] => {
  return PROMPT_TEMPLATES.filter(template => template.category === category);
};

/**
 * Search templates by query
 */
export const searchTemplates = (query: string): PromptTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return PROMPT_TEMPLATES.filter(template => 
    template.title.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Filter templates
 */
export const filterTemplates = (filters: import('./types').TemplateFilters): PromptTemplate[] => {
  let filtered = PROMPT_TEMPLATES;
  
  // Category filter
  if (filters.category !== 'all') {
    filtered = filtered.filter(t => t.category === filters.category);
  }
  
  // Difficulty filter
  if (filters.difficulty !== 'all') {
    filtered = filtered.filter(t => t.difficulty === filters.difficulty);
  }
  
  // Search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  return filtered;
};

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): PromptTemplate | undefined => {
  return PROMPT_TEMPLATES.find(template => template.id === id);
};
