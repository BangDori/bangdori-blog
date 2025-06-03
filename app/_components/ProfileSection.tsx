'use client';

import Image from 'next/image';
import { FileUser, Github, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const socialLinks = [
  {
    icon: Github,
    href: 'https://github.com/bangdori',
  },
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/in/bangdori/',
  },
  {
    icon: Instagram,
    href: 'https://www.instagram.com/joooon2_/',
  },
  {
    icon: FileUser,
    href: 'https://www.rallit.com/hub/resumes/1244032/%EA%B0%95%EB%B3%91%EC%A4%80',
  },
];

export default function ProfileSection() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-muted rounded-full p-2">
              <div className="h-36 w-36 overflow-hidden rounded-full">
                <Image
                  src="/images/profile.jpeg"
                  alt="강병준 프로필 이미지"
                  width={144}
                  height={144}
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-bold">강병준</h3>
            <p className="text-primary text-sm">Frontend Developer</p>
          </div>

          <div className="flex justify-center gap-2">
            {socialLinks.map((item, index) => (
              <Button key={index} variant="ghost" className="bg-primary/10" size="icon" asChild>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  <item.icon className="h-4 w-4" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
