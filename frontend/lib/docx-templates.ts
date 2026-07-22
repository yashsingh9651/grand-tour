import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

export interface TravelDocumentData {
  studentName?: string
  studentAddress?: string
  studentPincode?: string
  studentNumber?: string
  studentEmail?: string
  studentPassportNumber?: string
  internshipDuration?: string
  hotelName?: string
  hotelAddress?: string
  yearOfDegree?: string
  degreeName?: string
  collegeName?: string
  departmentName?: string
  monthlyStipend?: string
  internshipDate?: string
  revisedArrivalDate?: string
  nextDegree?: string
  employerName?: string
  employerNumber?: string
  employerEmail?: string
  collegeDirectorName?: string
  collegeNumber?: string
  collegeEmail?: string
  sponsorName?: string
  sponsorAddress?: string
  sponsorRelationToStudent?: string
  studentRelationToSponsor?: string
  affiliatedUniversityName?: string
  courseBatch?: string
  date?: string
}

function findValueByKeyAliases(sources: any[], aliases: string[], fallback: string = ''): string {
  for (const src of sources) {
    if (!src || typeof src !== 'object') continue

    // 1. Direct exact or normalized key match
    for (const key of Object.keys(src)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')
      for (const alias of aliases) {
        const normalizedAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (normalizedKey === normalizedAlias && src[key] !== undefined && src[key] !== null && String(src[key]).trim() !== '') {
          return String(src[key]).trim()
        }
      }
    }
  }

  // 2. Partial match if no exact match found
  for (const src of sources) {
    if (!src || typeof src !== 'object') continue
    for (const key of Object.keys(src)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')
      for (const alias of aliases) {
        const normalizedAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '')
        if ((normalizedKey.includes(normalizedAlias) || normalizedAlias.includes(normalizedKey)) && src[key] !== undefined && src[key] !== null && String(src[key]).trim() !== '') {
          return String(src[key]).trim()
        }
      }
    }
  }

  return fallback
}

export function resolveData(inputData: any = {}): Required<TravelDocumentData> {
  const user = inputData?.user || {}
  const appData = inputData?.data || {}
  const hotel = inputData?.assignedHotel || {}
  const sources = [inputData, appData, user, hotel]

  const userFullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
  const studentNameVal = findValueByKeyAliases(
    sources,
    ['studentName', 'fullName', 'applicantName', 'candidateName', 'name', 'firstName', 'student_name', 'full_name'],
    userFullName || 'Student Name'
  )

  const studentAddressVal = findValueByKeyAliases(
    sources,
    ['studentAddress', 'address', 'residentialAddress', 'permanentAddress', 'currentAddress', 'city', 'location'],
    'Address Line 1, City'
  )

  const studentPincodeVal = findValueByKeyAliases(
    sources,
    ['studentPincode', 'pincode', 'pinCode', 'zipCode', 'postalCode', 'zip'],
    '400001'
  )

  const studentNumberVal = findValueByKeyAliases(
    sources,
    ['studentNumber', 'phone', 'phoneNumber', 'mobile', 'mobileNumber', 'contactNumber', 'whatsapp'],
    user.phone || '+91 9876543210'
  )

  const studentEmailVal = findValueByKeyAliases(
    sources,
    ['studentEmail', 'email', 'userEmail', 'primaryEmail', 'mail'],
    user.email || 'student@example.com'
  )

  const studentPassportNumberVal = findValueByKeyAliases(
    sources,
    ['studentPassportNumber', 'passportNumber', 'passportNo', 'passportNum', 'passport'],
    inputData?.passportNumber || 'A1234567'
  )

  const internshipDurationVal = findValueByKeyAliases(
    sources,
    ['internshipDuration', 'duration', 'period', 'months', 'tenure'],
    '6 Months'
  )

  const hotelNameVal = findValueByKeyAliases(
    sources,
    ['hotelName', 'hotel', 'companyName', 'hostHotel', 'organization'],
    hotel.name || 'Grand Hotel Paris'
  )

  const hotelAddressVal = findValueByKeyAliases(
    sources,
    ['hotelAddress', 'hotelLocation', 'address', 'location', 'city'],
    hotel.address || hotel.location || 'Paris, France'
  )

  const yearOfDegreeVal = findValueByKeyAliases(
    sources,
    ['yearOfDegree', 'currentYear', 'year', 'academicYear', 'enrollmentYear', 'enrollmentStatus'],
    '3rd Year'
  )

  const degreeNameVal = findValueByKeyAliases(
    sources,
    ['degreeName', 'course', 'degree', 'program', 'specialization'],
    'B.Sc in Hospitality & Hotel Administration'
  )

  const collegeNameVal = findValueByKeyAliases(
    sources,
    ['collegeName', 'educationalInstitution', 'institution', 'university', 'institute', 'school'],
    'IHM Institute'
  )

  const departmentNameVal = findValueByKeyAliases(
    sources,
    ['departmentName', 'preferredDepartment', 'department', 'sector'],
    'Food & Beverage / Culinary'
  )

  const monthlyStipendVal = findValueByKeyAliases(
    sources,
    ['monthlyStipend', 'stipend', 'allowance', 'salary', 'remuneration'],
    '600 EUR / Month'
  )

  const internshipDateVal = findValueByKeyAliases(
    sources,
    ['internshipDate', 'preferredStartDate', 'startDate', 'commencementDate'],
    '01 August 2026'
  )

  const revisedArrivalDateVal = findValueByKeyAliases(
    sources,
    ['revisedArrivalDate', 'arrivalDate', 'expectedArrival', 'travelDate'],
    '15 August 2026'
  )

  const nextDegreeVal = findValueByKeyAliases(
    sources,
    ['nextDegree', 'futureDegree', 'higherEducation', 'nextYear'],
    'Final Year Degree'
  )

  const employerNameVal = findValueByKeyAliases(
    sources,
    ['employerName', 'representedBy', 'managerName', 'hotelManager', 'contactPerson'],
    hotel.representedBy || 'Hotel General Manager'
  )

  const employerNumberVal = findValueByKeyAliases(
    sources,
    ['employerNumber', 'employerPhone', 'hotelPhone', 'contactPhone'],
    hotel.phone || '+33 1 42 68 55 00'
  )

  const employerEmailVal = findValueByKeyAliases(
    sources,
    ['employerEmail', 'hotelEmail', 'contactEmail'],
    hotel.email || 'contact@hotel.fr'
  )

  const collegeDirectorNameVal = findValueByKeyAliases(
    sources,
    ['collegeDirectorName', 'tpoName', 'directorName', 'principalName', 'tpoOfficer'],
    'Director / Principal'
  )

  const collegeNumberVal = findValueByKeyAliases(
    sources,
    ['collegeNumber', 'tpoPhone', 'institutionPhone', 'collegePhone'],
    '+91 22 2445 7200'
  )

  const collegeEmailVal = findValueByKeyAliases(
    sources,
    ['collegeEmail', 'tpoEmail', 'institutionEmail'],
    'principal@college.edu'
  )

  const sponsorNameVal = findValueByKeyAliases(
    sources,
    ['sponsorName', 'fatherName', 'parentName', 'sponsor', 'guardianName'],
    'Sponsor Name'
  )

  const sponsorAddressVal = findValueByKeyAliases(
    sources,
    ['sponsorAddress', 'parentAddress', 'guardianAddress', 'address'],
    studentAddressVal || 'Sponsor Address, City, India'
  )

  const sponsorRelationToStudentVal = findValueByKeyAliases(
    sources,
    ['sponsorRelationToStudent', 'relationToStudent', 'sponsorRelation', 'relationship'],
    'Father'
  )

  const studentRelationToSponsorVal = findValueByKeyAliases(
    sources,
    ['studentRelationToSponsor', 'relationToSponsor', 'studentRelation'],
    'Son'
  )

  const affiliatedUniversityNameVal = findValueByKeyAliases(
    sources,
    ['affiliatedUniversityName', 'universityName', 'university', 'affiliation'],
    'NCHMCT'
  )

  const courseBatchVal = findValueByKeyAliases(
    sources,
    ['courseBatch', 'batch', 'session', 'academicBatch', 'passingYear'],
    '2024-2027'
  )

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return {
    studentName: studentNameVal,
    studentAddress: studentAddressVal,
    studentPincode: studentPincodeVal,
    studentNumber: studentNumberVal,
    studentEmail: studentEmailVal,
    studentPassportNumber: studentPassportNumberVal,
    internshipDuration: internshipDurationVal,
    hotelName: hotelNameVal,
    hotelAddress: hotelAddressVal,
    yearOfDegree: yearOfDegreeVal,
    degreeName: degreeNameVal,
    collegeName: collegeNameVal,
    departmentName: departmentNameVal,
    monthlyStipend: monthlyStipendVal,
    internshipDate: internshipDateVal,
    revisedArrivalDate: revisedArrivalDateVal,
    nextDegree: nextDegreeVal,
    employerName: employerNameVal,
    employerNumber: employerNumberVal,
    employerEmail: employerEmailVal,
    collegeDirectorName: collegeDirectorNameVal,
    collegeNumber: collegeNumberVal,
    collegeEmail: collegeEmailVal,
    sponsorName: sponsorNameVal,
    sponsorAddress: sponsorAddressVal,
    sponsorRelationToStudent: sponsorRelationToStudentVal,
    studentRelationToSponsor: studentRelationToSponsorVal,
    affiliatedUniversityName: affiliatedUniversityNameVal,
    courseBatch: courseBatchVal,
    date: currentDate,
  }
}


// 1. Cover Letter French Template
export async function generateCoverLetterFrenchDocx(rawInput: any) {
  const d = resolveData(rawInput)

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: 'De :', bold: true }),
              new TextRun({ text: `\nNom : ${d.studentName}` }),
              new TextRun({ text: `\nAdresse : ${d.studentAddress}` }),
              new TextRun({ text: `\nCode postal : ${d.studentPincode}` }),
              new TextRun({ text: `\nCoordonnées : ${d.studentNumber}` }),
              new TextRun({ text: `\nAdresse e-mail : ${d.studentEmail}` }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'À :', bold: true }),
              new TextRun({ text: '\nLe Responsable des Visas,' }),
              new TextRun({ text: '\nConsulat Général de France,' }),
              new TextRun({ text: '\nMumbai.' }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Objet : Demande de Visa Long Séjour pour un Stage de ${d.internshipDuration}`,
                bold: true,
              }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [new TextRun('Monsieur/Madame,')],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `Je soussignée, ${d.studentName}, soumets ma candidature pour un visa long séjour afin de réaliser un stage de ${d.internshipDuration} au sein de ${d.hotelName}`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `Je suis actuellement en ${d.yearOfDegree} de ${d.degreeName} à ${d.collegeName},`
              ),
              new TextRun(
                "\nCe stage constitue une composante essentielle de mon cursus, visant à m'offrir une expérience pratique et une exposition au secteur mondial de l’hôtellerie, en adéquation avec mes aspirations professionnelles."
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `Durant mon stage, je travaillerai dans le département Département ${d.departmentName} sous la supervision de professionnels expérimentés de ${d.hotelName}. Mon employeur d'accueil m'accorde gracieusement l'hébergement et les repas, garantissant ainsi mon bien-être. De plus, je percevrai une indemnité mensuelle de ${d.monthlyStipend} pour couvrir mes frais de subsistance en France.`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `Le stage est prévu du ${d.internshipDate}. Cependant, en raison d’un dysfonctionnement du site VFS, je n’ai pas pu obtenir de rendez-vous plus tôt. Ainsi, je ne suis malheureusement pas en mesure de commencer mon stage le ${d.internshipDate} en raison des délais nécessaires au traitement de ma demande de visa.`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `Je prévois désormais d’arriver en France le ${d.revisedArrivalDate}. À l’issue de cette période, je m’engage pleinement à retourner en Inde pour poursuivre mes études en ${d.nextDegree} de mon programme de licence au sein de la même institution. Le rapport de stage et l'examen final sont des éléments cruciaux de mon programme que je complèterai à mon retour.`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Notre établissement a une longue tradition de stages internationaux, témoignant de son engagement à offrir aux étudiants une exposition globale.'
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Pour appuyer ma demande de visa, j’ai joint les documents suivants :',
                bold: true,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Documents de Visa', bold: true, size: 24 })],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Section 1 : Convention de Stage et Autorisation de Travail', bold: true })],
          }),
          new Paragraph({ text: "• Convention de stage signée par l'entreprise d'accueil, l'établissement et moi-même." }),
          new Paragraph({ text: '• Confirmation de Dépôt.' }),
          new Paragraph({ text: '• Avis Favorable sur la Convention de Stage.', spacing: { after: 150 } }),

          new Paragraph({
            children: [new TextRun({ text: 'Section 2 : Demande de Visa et Biométrie', bold: true })],
          }),
          new Paragraph({ text: '• Formulaire de demande de visa long séjour signé et daté.' }),
          new Paragraph({ text: '• Lettre de rendez-vous pour la demande de visa.' }),
          new Paragraph({ text: '• Lettre de motivation en anglais et en français (signée et datée).' }),
          new Paragraph({ text: '• Passeport original et photos d’identité pour la biométrie.', spacing: { after: 150 } }),

          new Paragraph({
            children: [new TextRun({ text: 'Section 3 : Preuve de Soutien Financier', bold: true })],
          }),
          new Paragraph({ text: '• Relevé bancaire de mon parrain (6 derniers mois).' }),
          new Paragraph({ text: '• Lettre de confirmation du solde bancaire avec cachet et tampon officiels.' }),
          new Paragraph({ text: '• Fiches de paie de mon parrain (6 derniers mois).' }),
          new Paragraph({ text: "• Déclaration d'impôt sur le revenu de mon parrain (3 dernières années)." }),
          new Paragraph({ text: '• Lettre de parrainage financier.' }),
          new Paragraph({ text: '• Coordonnées de la carte PAN de mon parrain.' }),
          new Paragraph({ text: "• Carte Aadhar (carte d'identité nationale) de mon parrain.", spacing: { after: 150 } }),

          new Paragraph({
            children: [new TextRun({ text: 'Section 4 : Assurance', bold: true })],
          }),
          new Paragraph({ text: "• Certificat d'assurance voyage couvrant mon séjour en France.", spacing: { after: 150 } }),

          new Paragraph({
            children: [new TextRun({ text: 'Section 5 : Preuve d’Hébergement', bold: true })],
          }),
          new Paragraph({ text: "• Lettre signée d’hébergement gratuit de mon employeur d’accueil.", spacing: { after: 150 } }),

          new Paragraph({
            children: [new TextRun({ text: 'Section 6 : Documents Institutionnels', bold: true })],
          }),
          new Paragraph({ text: '• Certificat de non-objection (NOC).' }),
          new Paragraph({ text: '• Certificat de scolarité.' }),
          new Paragraph({ text: '• Certificat d’attestation scolaire en français.' }),
          new Paragraph({ text: '• Certificat de scolarité en français.' }),
          new Paragraph({ text: '• Relevé de notes de première année de mon institution actuelle.', spacing: { after: 150 } }),

          new Paragraph({
            children: [new TextRun({ text: 'Section 7 : Documents Personnels', bold: true })],
          }),
          new Paragraph({ text: '• CV actualisé.' }),
          new Paragraph({ text: '• Certificat de réussite au diplôme de 10e année.' }),
          new Paragraph({ text: '• Certificat de réussite au diplôme de 12e année.', spacing: { after: 200 } }),

          new Paragraph({
            children: [
              new TextRun(
                "En cas de doute sur l’authenticité de mes documents ou si vous souhaitez une vérification supplémentaire auprès de mon établissement ou de mon employeur d’accueil en France, n’hésitez pas à les contacter directement par email ou téléphone. Je suis également disponible pour un entretien verbal si des clarifications supplémentaires sont nécessaires."
              ),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '• Mes coordonnées :\n', bold: true }),
              new TextRun(`  Mobile : ${d.studentNumber}\n`),
              new TextRun(`  Email: ${d.studentEmail}`),
            ],
            spacing: { after: 150 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "• Coordonnées de l'entreprise d'accueil :\n", bold: true }),
              new TextRun(`  Nom : ${d.hotelName}\n`),
              new TextRun(`  Nom de l'employeur : ${d.employerName}\n`),
              new TextRun(`  Mobile : ${d.employerNumber}\n`),
              new TextRun(`  E-mail : ${d.employerEmail}`),
            ],
            spacing: { after: 150 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '• Coordonnées de l’établissement :\n', bold: true }),
              new TextRun(`  Nom : ${d.collegeName}\n`),
              new TextRun(`  Directeur : ${d.collegeDirectorName}\n`),
              new TextRun(`  Mobile : ${d.collegeNumber}\n`),
              new TextRun(`  Email : ${d.collegeEmail}`),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun(
                "Avec mon parcours académique, cette opportunité de stage et mon engagement à retourner en Inde, je suis confiante dans ma demande de visa long séjour pour stage. Cette expérience renforcera mes compétences et mon employabilité future dans le secteur de l’hôtellerie."
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Je vous remercie de bien vouloir examiner ma demande. Dans l’attente de votre réponse favorable.'
              ),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Cordialement,\n' }),
              new TextRun({ text: `${d.studentName}\n`, bold: true }),
              new TextRun({ text: 'Signature\n' }),
              new TextRun({ text: `Date: ${d.date}` }),
            ],
          }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBlob(doc)
  saveAs(buffer, 'Cover_Letter_French_Template.docx')
}

// 2. Affidavit Template
export async function generateAffidavitDocx(rawInput: any) {
  const d = resolveData(rawInput)

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: 'To The Visa Consulate of France,\n', bold: true }),
              new TextRun({ text: 'Chennai', bold: true }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `I under sign as ${d.sponsorName} residing at ${d.sponsorAddress}, ${d.sponsorRelationToStudent} of ${d.studentName}, with Indian Passport number ${d.studentPassportNumber} is going for a Supervised employment in ${d.departmentName} department at ${d.hotelName}, ${d.hotelAddress}`
              ),
            ],
            spacing: { after: 250 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                'I am giving him financial support, expense for Air fare, visa and other expenses with this travel will be borne by me.'
              ),
            ],
            spacing: { after: 250 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `I have no objection providing my financial supporting documents like IT returns, pancard, for visa application for my ${d.studentRelationToSponsor} ${d.studentName}`
              ),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Thanking you.', bold: true })],
          }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBlob(doc)
  saveAs(buffer, 'Affidavit_Template.docx')
}

// 3. Financial Sponsorship Letter French
export async function generateFinancialSponsorshipFrenchDocx(rawInput: any) {
  const d = resolveData(rawInput)

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: 'Lettre de Parrainage Financier\n', bold: true, size: 28 }),
              new TextRun({ text: "À l'attention de,\n" }),
              new TextRun({ text: "L'Officier des Visas,\n" }),
              new TextRun({ text: 'Consulat Général de France,\n' }),
              new TextRun({ text: 'Mumbai, Inde' }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Objet : Parrainage pour ${d.studentName} pour une Formation Industrielle Supervisée de ${d.internshipDuration} en France`,
                bold: true,
              }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [new TextRun('Madame/Monsieur,')],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `Je suis heureux de confirmer mon soutien financier à mon ${d.studentRelationToSponsor}: ${d.studentName}, titulaire du passeport indien n° ${d.studentPassportNumber}, afin de lui permettre d'effectuer un stage en entreprise supervisé chez ${d.hotelName}`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `Je suis ${d.sponsorName}, ${d.sponsorAddress}. Je suis l'${d.sponsorRelationToStudent} de ${d.studentName} et je m'engage pleinement à lui fournir le soutien financier nécessaire à son programme de formation.`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `${d.studentName} poursuit actuellement la ${d.yearOfDegree} de son ${d.degreeName} at ${d.collegeName}, affilié à ${d.affiliatedUniversityName}, pour la promotion ${d.courseBatch}.`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `Il a été sélectionné pour suivre une formation industrielle supervisée à ${d.hotelName}, ce qui constitue une excellente occasion pour lui d'acquérir une précieuse expérience pratique dans le secteur de l'hôtellerie.`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `Je prendrai en charge tous les frais liés à la formation de ${d.studentName} y compris le billet d'avion, les frais de visa et tous les frais accessoires encourus pendant son séjour en France. Je suis financièrement capable de fournir ce soutien, comme le prouvent les copies jointes de mes relevés bancaires, de ma carte PAN et d'autres documents pertinents.`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `Je n'ai aucune objection à fournir tout document supplémentaire requis par le consulat général pour appuyer la demande de visa de ${d.studentRelationToSponsor}.. Je suis convaincu que ${d.studentName} saura tirer le meilleur parti de cette opportunité et retournera en Inde avec des compétences et des connaissances accrues dans le domaine de l'hôtellerie et de la restauration.`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `Merci de prendre en considération la demande de visa de ${d.studentName} J'apprécie le temps et l'attention que vous accordez à cette question.`
              ),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Cordialement,\n' }),
              new TextRun({ text: `${d.sponsorName}\n`, bold: true }),
              new TextRun({ text: 'Signature:\n' }),
              new TextRun({ text: `Date: ${d.date}` }),
            ],
          }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBlob(doc)
  saveAs(buffer, 'Financial_Sponsorship_Letter_French.docx')
}

// 4. Financial Sponsorship Letter English
export async function generateFinancialSponsorshipEnglishDocx(rawInput: any) {
  const d = resolveData(rawInput)

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: 'Financial Sponsorship Letter\n', bold: true, size: 28 }),
              new TextRun({ text: 'To,\n' }),
              new TextRun({ text: 'The Visa Officer,\n' }),
              new TextRun({ text: 'Consulate General of France,\n' }),
              new TextRun({ text: 'Mumbai, India' }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Subject: Sponsorship for: ${d.studentName} for ${d.internshipDuration} Supervised Industrial Training in France`,
                bold: true,
              }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [new TextRun('Dear Sir/Madam,')],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `I am writing to confirm my financial sponsorship for my ${d.studentRelationToSponsor}: ${d.studentName} who holds Indian Passport No. ${d.studentPassportNumber} to undertake Supervised Industrial Training in the ${d.departmentName} department at ${d.hotelName}`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `I am ${d.sponsorName}, ${d.sponsorAddress} . I am ${d.sponsorRelationToStudent} of ${d.studentName}, and I am fully committed to providing him with the necessary financial support for his training program.`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `${d.studentName}, is currently pursuing ${d.yearOfDegree} of his/her ${d.degreeName} at ${d.collegeName}, affiliated with ${d.affiliatedUniversityName}, for the batch ${d.courseBatch}`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `He has been selected for Supervised Industrial Training at ${d.hotelName} , which is an excellent opportunity for his to gain valuable hands-on experience in the hospitality industry.`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `I will bear all expenses related to ${d.studentName} training, including airfare, visa-related expenses, and any incidental expenses incurred during his stay in France. I am financially capable of providing this support, as evidenced by the attached copies of my bank statements, PAN card, and other relevant documents.`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `I have no objection to providing any additional documentation required by the Consulate General to support my ${d.studentRelationToSponsor}’s visa application. I am confident that ${d.studentName} will make the most of this opportunity and return to India with enhanced skills and knowledge in the hospitality field.`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun(
                `Thank you for considering ${d.studentName}, visa application. I appreciate your time and attention to this matter.`
              ),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Sincerely,\n' }),
              new TextRun({ text: `Name: ${d.sponsorName}\n`, bold: true }),
              new TextRun({ text: 'Signature:' }),
            ],
          }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBlob(doc)
  saveAs(buffer, 'Financial_Sponsorship_Letter_English.docx')
}

export const OFFICIAL_TRAVEL_TEMPLATES = [
  {
    id: 'cover_letter_french',
    name: 'Cover Letter (French Visa)',
    filename: 'Cover_Letter_French_Template.docx',
    language: 'French',
    description: 'Official Long Stay Visa Cover Letter in French for Consulat Général de France',
    generate: generateCoverLetterFrenchDocx,
  },
  {
    id: 'affidavit',
    name: 'Affidavit of Financial Support',
    filename: 'Affidavit_Template.docx',
    language: 'English',
    description: 'Financial Support Affidavit for French Consulate Visa Application',
    generate: generateAffidavitDocx,
  },
  {
    id: 'financial_sponsorship_french',
    name: 'Financial Sponsorship Letter (French)',
    filename: 'Financial_Sponsorship_Letter_French.docx',
    language: 'French',
    description: 'Lettre de Parrainage Financier in French for Visa Sponsorship',
    generate: generateFinancialSponsorshipFrenchDocx,
  },
  {
    id: 'financial_sponsorship_english',
    name: 'Financial Sponsorship Letter (English)',
    filename: 'Financial_Sponsorship_Letter_English.docx',
    language: 'English',
    description: 'Financial Sponsorship Letter in English for Visa Application',
    generate: generateFinancialSponsorshipEnglishDocx,
  },
]
