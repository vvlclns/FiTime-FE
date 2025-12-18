import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/axios';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const CreateRoomSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '약속 제목은 필수입니다.')
    .max(50, '약속 제목은 50자 이하로 입력해주세요.'),
  descriptions: z
    .string()
    .trim()
    .max(300, '약속 설명은 300자 이하로 입력해주세요.')
    .optional(),
});

type CreateRoomFormValues = z.infer<typeof CreateRoomSchema>;

export default function CreateRoom() {
  const navigate = useNavigate();

  const form = useForm<CreateRoomFormValues>({
    resolver: zodResolver(CreateRoomSchema),
    defaultValues: {
      title: '',
      descriptions: '',
    },
  });

  const onSubmit = async (values: CreateRoomFormValues) => {
    try {
      const { data } = await api.post<{ link: string }>('/room/create', values);
      navigate('/create/complete', {
        state: { link: data.link },
      });
    } catch (err) {
      alert('약속 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    // 바깥 프레임
    <div className="relative w-full min-h-screen bg-gray-100">
      {/* 중앙 컨텐츠 프레임 */}
      <div className="w-[375px] mx-auto bg-white min-h-screen">
        <Header />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="absolute flex flex-col w-[375px] top-[90px] px-5 py-4 gap-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>약속 제목</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="약속의 제목을 입력해주세요"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-left" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descriptions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>약속 설명 (선택)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="약속의 설명을 입력해주세요"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-left" />
                  </FormItem>
                )}
              />
            </div>
            <div className="absolute flex w-[375px] top-[320px] px-5 py-9 gap-2.5">
              <Button type="submit" className="w-full">
                약속 생성하기
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
