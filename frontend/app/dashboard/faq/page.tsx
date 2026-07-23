'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { dummyStudentProfile } from '@/lib/student-profile'
import { ChevronDown, Loader2 } from 'lucide-react'
import { applicationService } from '@/lib/services/api.service'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await applicationService.getMy()
        setApplication(data)
      } catch (error: any) {
        console.error('Error fetching FAQ application data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const faqs = [
    {
      category: 'General',
      questions: [
        { q: 'What is this internship program about?', a: 'This is an international internship program offering students exposure to global work culture and professional development.' },
        { q: 'Who can apply?', a: 'Current students from recognized colleges with a minimum CGPA of 6.5 can apply for this program.' },
        { q: 'What is the duration?', a: 'The internship duration is 2 months (8 weeks) with flexible start dates depending on your academic calendar.' },
      ]
    },
    {
      category: 'Application Process',
      questions: [
        { q: 'How long does the application process take?', a: 'The entire process takes 2-3 weeks from application submission to final selection.' },
        { q: 'What documents do I need?', a: 'You need CV, passport copy, college ID, proof of address, and a recent passport photo.' },
        { q: 'Can I edit my application after submission?', a: 'Yes, you can make changes within 48 hours of submission. After that, contact support.' },
      ]
    },
    {
      category: 'Interview',
      questions: [
        { q: 'How is the interview conducted?', a: 'Interviews are conducted online via Zoom, lasting 30 minutes with 2-3 panel members.' },
        { q: 'What topics will be covered?', a: 'Questions focus on your background, motivation, technical skills, and fit for the role.' },
        { q: 'Can I reschedule my interview?', a: 'Yes, you can reschedule up to 48 hours before your scheduled interview slot.' },
      ]
    },
    {
      category: 'Payment & Logistics',
      questions: [
        { q: 'What is the program cost?', a: 'The internship fee is ₹50,000 (excluding GST). There are no hidden charges.' },
        { q: 'What payment methods are accepted?', a: 'We accept bank transfers, UPI, credit cards, and debit cards for payment.' },
        { q: 'Is accommodation provided?', a: 'Yes, accommodation is provided by the program for the internship duration.' },
      ]
    },
    {
      category: 'Visa & Travel',
      questions: [
        { q: 'Do you help with visa applications?', a: 'Yes, we provide visa sponsorship and guidance throughout the application process.' },
        { q: 'What about travel arrangements?', a: 'You arrange your own travel, but we provide guidance and support for the process.' },
        { q: 'Is travel insurance required?', a: 'Yes, travel insurance is mandatory and should be arranged before your departure.' },
      ]
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const STEP_ORDERS: Record<string, number> = {
    application: 1,
    documents: 2,
    interview: 3,
    payment1: 4,
    hotel: 5,
    payment2: 6,
    contract: 7,
    workpermit: 8,
    payment3: 9,
    visapayments: 10,
    visa: 11,
    travel: 12,
  }

  const currentStepOrder = STEP_ORDERS[application?.currentStepId || 'application'] ?? 1
  const isFaqUnlocked = currentStepOrder >= STEP_ORDERS['hotel']

  if (!isFaqUnlocked) {
    return (
      <StudentLayout currentStep={application?.currentStepId}>
        <div className="max-w-3xl rounded-3xl border border-dashed border-border bg-secondary/20 p-8 text-foreground mx-auto mt-10 text-center space-y-4">
          <h2 className="text-2xl font-bold">FAQ Section — Locked</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            This FAQ section will automatically unlock after you complete your 1st Installment Payment.
          </p>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout currentStep={application?.currentStepId}>
      <div className="max-w-3xl space-y-6 text-foreground">
        <div className="space-y-1.5 sm:space-y-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Frequently Asked Questions</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Find answers to common questions about our internship program</p>
        </div>


        <div className="space-y-6">
          {faqs.map((section, sectionIndex) => (
            <div key={section.category} className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">{section.category}</h2>
              <div className="space-y-2">
                {section.questions.map((faq, qIndex) => {
                  const itemIndex = sectionIndex * 100 + qIndex
                  const isOpen = openIndex === itemIndex

                  return (
                    <Card
                      key={qIndex}
                      className="p-4 border border-border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setOpenIndex(isOpen ? null : itemIndex)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-semibold text-foreground flex-1">{faq.q}</p>
                        <ChevronDown
                          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      {isOpen && (
                        <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                          {faq.a}
                        </p>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <Card className="p-6 bg-muted border border-border">
          <h3 className="font-semibold text-foreground mb-2">Didn&apos;t find your answer?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Contact our support team for additional help
          </p>
          <div className="flex gap-4">
            <button className="text-sm font-semibold text-primary hover:underline" onClick={() => window.open('mailto:support@luminaacademy.com')}>Email Support</button>
            <button className="text-sm font-semibold text-primary hover:underline" onClick={() => window.open('https://wa.me/1234567890')}>WhatsApp Chat</button>
          </div>
        </Card>
      </div>
    </StudentLayout>
  )
}
