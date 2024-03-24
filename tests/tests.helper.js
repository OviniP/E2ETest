const loginWith = async (page, userName, password) => {
    const txtuserName  = page.getByPlaceholder('userName')
    const txtpassword = page.getByPlaceholder('password')
    const submit = page.getByTestId('btnSubmit')
    await txtuserName.fill(userName)
    await txtpassword.fill(password)
    await submit.click()
}

const createBlog = async (page, title, author, url) => {
    await page.getByRole('button', { name: 'New Blog' }).click()
    await page.getByPlaceholder('title').fill(title)
    await page.getByPlaceholder('author').fill(author)
    await page.getByPlaceholder('url').fill(url)
    await page.getByRole('button', { name: 'Create' }).click()
    await page.getByText(title).nth(0).waitFor()
}

export {loginWith, createBlog}