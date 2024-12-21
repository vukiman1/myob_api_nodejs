export class FollowedCompanyResponseDto {
    static toResponse(followedCompany: any) {
      return {
        id: followedCompany.id,
        company: {
          id: followedCompany.company.id,
          slug: followedCompany.company.slug,
          companyName: followedCompany.company.companyName,
          fieldOperation: followedCompany.company.fieldOperation,
          companyImageUrl: followedCompany.company.companyImageUrl,
          followNumber: followedCompany.company.followNumber,
          jobPostNumber: followedCompany.company.jobPostNumber,
          isFollowed: followedCompany.company.isFollowed,
        },
      };
    }
  }
  