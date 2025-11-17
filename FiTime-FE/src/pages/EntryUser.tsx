import { useNavigate } from 'react-router-dom';
import { useEntryStore } from '@/stores/entryStore';
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

  const defaultUsername = useEntryStore((state) => state.username);
  const defaultPassword = useEntryStore((state) => state.password);
  const setUserData = useEntryStore((state) => state.setUserData);

  const form = useForm<EntryUserFormValues>({
    resolver: zodResolver(EntryUserSchema),
    defaultValues: {
      username: defaultUsername || '',
      password: defaultPassword || '',
    },
  });

  function onSubmit(values: EntryUserFormValues) {
    setUserData({
      username: values.username,
      password: values.password,
    });

    navigate('timetable');
  }

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
