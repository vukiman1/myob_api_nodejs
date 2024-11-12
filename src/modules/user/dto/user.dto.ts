//user
export class UserResponseDto {
    static toResponse(user: any) {
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
        isVerifyEmail: user.isVerifyEmail,
        avatarUrl: user.avatarUrl,
        roleName: user.roleName,
        jobSeekerProfileId: user.jobSeekerProfile ? user.jobSeekerProfile.id : null,  // Sửa cú pháp ở đây
        jobSeekerProfile: user.jobSeekerProfile ? {
            id: user.jobSeekerProfile.id,
            phone: user.jobSeekerProfile.phone,
        } : null,
        companyId: user.company ? user.company.id : null,  // Sửa cú pháp ở đây
        company: user.company ? {
            id: user.company.id,
            slug: user.company.slug,
            companyName: user.company.companyName,
            imageUrl: user.company.companyImageUrl,
        } : null,
      }
    }
}