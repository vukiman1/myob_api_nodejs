import { Resume } from "../entities/resume.entity";

export class ResumeResponseDto {
    static toResponse(resume: Resume, isSaved: boolean, isSendMail: boolean) {
      return {
        id: resume.id,
        slug: resume.slug,
        title: resume.title,
        description: resume.description,
        salaryMin: resume.salaryMin,
        salaryMax: resume.salaryMax,
        position: resume.position,
        experience: resume.experience,
        academicLevel: resume.academicLevel,
        typeOfWorkplace: resume.typeOfWorkplace,
        jobType: resume.jobType,
        isActive: resume.isActive,
        city: resume.city,
        career: resume.career,
        updateAt: resume.updateAt,
        fileUrl: resume.fileUrl,
        // filePublicId: resume.filePublicId,
        isSaved: isSaved,
        type: resume.type,
        user: {
          id: resume.user.id,
          fullName: resume.user.fullName,
          email: resume.user.email,
          avatarUrl: resume.user.avatarUrl,
        },
        jobSeekerProfile: {
          phone: resume.user.jobSeekerProfile.phone,
          birthday: resume.user.jobSeekerProfile.birthday,
          gender: resume.user.jobSeekerProfile.gender,
          maritalStatus: resume.user.jobSeekerProfile.maritalStatus,
          location: resume.user.jobSeekerProfile.location,
        },
        experiencesDetails: resume.experiencesDetails,
        educationDetails: resume.educationDetail.map(education => ({
          degreeName: education.degreeName,
          major: education.major,
          trainingPlaceName: education.trainingPlaceName,
          startDate: education.startDate,
          completedDate: education.completedDate,
          description: education.description,
        })),
        certificates: resume.certificatesDetail.map(certificate => ({
          name: certificate.name,
          trainingPlace: certificate.trainingPlace,
          startDate: certificate.startDate,
          expirationDate: certificate.expirationDate,
        })),
        languageSkills: resume.languageSkills.map(languageSkill => ({
          language: languageSkill.language,
          level: languageSkill.level,
        })),
        advancedSkills: resume.advancedSkills.map(advancedSkill => ({
          name: advancedSkill.name,
          level: advancedSkill.level,
        })),
        lastViewedDate: resume.updateAt, // Giờ hiện tại khi gọi API
        isSentEmail:isSendMail,
      };
    }
  }
  