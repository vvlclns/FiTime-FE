import { useNavigate, useParams } from 'react-router-dom';
import { useEntryStore } from '@/stores/entryStore';
import { api } from '@/lib/axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const EntryUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, '이름은 필수입니다.')
    .max(20, '이름은 20자 이내로 입력해주세요.'),
  password: z
    .string()
    .trim()
    .min(4, '비밀번호는 4자 이상이어야 합니다.')
    .max(20, '비밀번호는 20자 이내로 입력해주세요.'),
});

type EntryUserFormValues = z.infer<typeof EntryUserSchema>;

export function EntryUser() {
  const navigate = useNavigate();
  const { room_link } = useParams();

  const defaultUsername = useEntryStore((state) => state.username);
  const defaultPassword = useEntryStore((state) => state.password);
  const setUserData = useEntryStore((state) => state.setUserData);
  const setUser_id = useEntryStore((state) => state.setUser_id);

  const form = useForm<EntryUserFormValues>({
    resolver: zodResolver(EntryUserSchema),
    defaultValues: {
      username: defaultUsername || '',
      password: defaultPassword || '',
    },
  });

  const onSubmit = async (values: EntryUserFormValues) => {
    setUserData({
      username: values.username,
      password: values.password,
    });

    // 유저 등록/접속
    try {
      const { data } = await api.post<{
        status: string;
        message: string;
        user_id: string;
      }>('/user/login', {
        username: values.username,
        password: values.password,
        room_id: room_link,
      });

      if (data.user_id === '-1') {
        alert('잘못된 사용자 정보입니다.');
        return;
      }

      setUser_id({ user_id: data.user_id });
      navigate('timetable', { replace: true });
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert('비밀번호가 올바르지 않습니다.');
      } else if (err.response?.status === 404) {
        alert('해당 방이 존재하지 않습니다.');
        navigate('/', { replace: true });
      } else {
        alert('유저 등록/접속 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <>
      <div className="flex flex-col px-5 py-7.5 gap-6">
        <Progress value={25} />
        <div className="flex flex-col w-full gap-1 text-left">
          <div className="w-full">이름과 비밀번호를 입력해주세요</div>
          <div className="w-full text-xs text-gray-500">
            방 접속 및 수정 시 사용됩니다
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-col w-[375px] px-5 py-4 gap-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="이름을 입력해주세요"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-left" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="비밀번호를 입력해주세요"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-left" />
                </FormItem>
              )}
            />
          </div>
          <div className="flex w-[375px] px-5 py-9 gap-2.5">
            <Button type="submit" className="w-full">
              다음
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
